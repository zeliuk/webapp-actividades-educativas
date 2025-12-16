"use client";

import {
  use,
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { getActivityBySlugOrId } from "@/lib/activitiesService";
import { AuthCard } from "@/components/AuthCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type ActivityType = "quiz" | "anagram";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
};

type AnagramPuzzle = {
  word: string;
  hint: string;
};

type SlotPlacement = {
  letter: string;
  sourceIndex: number;
};

type Activity = {
  id: string;
  title: string;
  language: "es" | "en";
  type: ActivityType;
  isPublic: boolean;
  data: {
    questions: Question[];
    anagrams: AnagramPuzzle[];
  };
};

function stripAccents(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function buildScrambledWord(word: string) {
  const normalized = (word ?? "").replace(/\s+/g, "");
  if (normalized.length <= 1) return normalized.toUpperCase().split("");

  let shuffled = normalized;
  let attempts = 0;

  while (attempts < 10 && shuffled.toLowerCase() === normalized.toLowerCase()) {
    const chars = normalized.split("");
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    shuffled = chars.join("");
    attempts++;
  }

  return shuffled.toUpperCase().split("");
}

function normalizeWord(value: string) {
  return stripAccents(value.replace(/\s+/g, "").toLowerCase());
}

function normalizeChar(value: string) {
  return stripAccents(value).toLowerCase();
}

function getNormalizedLetters(word: string) {
  return (word ?? "").replace(/\s+/g, "").toUpperCase().split("");
}

function buildSlotTemplate(word: string): (SlotPlacement | null)[] {
  const length = getNormalizedLetters(word).length;
  return Array.from({ length }, () => null);
}

function buildWordFromSlots(slots: (SlotPlacement | null)[]) {
  return slots.map((slot) => slot?.letter ?? "").join("");
}

function formatTime(ms: number | null) {
  const safe =
    typeof ms === "number" && !Number.isNaN(ms) && ms > 0
      ? Math.floor(ms / 1000)
      : 0;
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function ActivityPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [activity, setActivity] = useState<Activity | null>(null);

  // Nombre del alumno
  const [studentName, setStudentName] = useState("");
  const [confirmedName, setConfirmedName] = useState(false);

  // Respuestas del alumno
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const answersRef = useRef<(number | string | null)[]>([]);
  const [scrambledWords, setScrambledWords] = useState<string[][]>([]);
  const [slotPlacements, setSlotPlacements] = useState<
    (SlotPlacement | null)[][]
  >([]);
  const [answeredQuestions, setAnsweredQuestions] = useState<boolean[]>([]);
  const [globalStartTime, setGlobalStartTime] = useState<number | null>(null);
  const [globalElapsed, setGlobalElapsed] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const autoAdvanceRef = useRef<number | null>(null);
  const quizAdvanceTimeout = useRef<number | null>(null);

  const totalItems =
    activity?.type === "quiz"
      ? activity.data.questions.length
      : activity?.type === "anagram"
        ? activity.data.anagrams.length
        : 0;

  const currentQuestion =
    activity?.type === "quiz" && totalItems > 0
      ? activity.data.questions[currentIndex]
      : null;

  const currentAnagram =
    activity?.type === "anagram" && totalItems > 0
      ? activity.data.anagrams[currentIndex]
      : null;

  const currentHasAnswer =
    totalItems > 0 && activity?.type === "quiz"
      ? answers[currentIndex] !== null && answers[currentIndex] !== undefined
      : false;
  const currentIsLast = totalItems > 0 ? currentIndex === totalItems - 1 : false;
  const submitAnswers = useCallback(
    (overrideAnswers?: (number | string | null)[]) => {
      if (!activity || submitted) return;
      if (quizAdvanceTimeout.current) {
        window.clearTimeout(quizAdvanceTimeout.current);
        quizAdvanceTimeout.current = null;
      }

      const sourceAnswers =
        overrideAnswers ??
        (answers.length > 0 ? answers : answersRef.current);
      const snapshot = [...sourceAnswers];

      let correct = 0;
      let attemptAnswers: (number | string | null)[] = snapshot;

      if (activity.type === "quiz") {
        activity.data.questions.forEach((q, i) => {
          if (snapshot[i] === q.correctIndex) correct++;
        });
      } else {
        const wordResponses = slotPlacements.map((slots) =>
          buildWordFromSlots(slots ?? [])
        );

        wordResponses.forEach((response, i) => {
          const normalizedResponse = normalizeWord(response);
          const solution = normalizeWord(
            activity.data.anagrams[i]?.word ?? ""
          );

          if (normalizedResponse && normalizedResponse === solution) {
            correct++;
          }
        });

        attemptAnswers = wordResponses;
        setAnswers(wordResponses);
        answersRef.current = wordResponses;
      }

      setSubmitted(true);
      setScore(correct);
      saveAttempt(correct, attemptAnswers);
    },
    [activity, slotPlacements, answers, submitted]
  );

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Cargar actividad
  useEffect(() => {
    async function load() {
      const result = (await getActivityBySlugOrId(id)) as Activity | null;

      // SOLO comprobamos si existe, NO si es pública
      if (!result) {
        toast.error("Actividad no encontrada");
        router.push("/");
        return;
      }

      const type = (result.type ?? "quiz") as ActivityType;
      const questions = Array.isArray(result.data?.questions)
        ? result.data.questions
        : [];
      const anagrams = Array.isArray(result.data?.anagrams)
        ? result.data.anagrams
        : [];

      setActivity({
        id: result.id,
        title: result.title,
        language: result.language ?? "es",
        isPublic: result.isPublic ?? false, // este campo ya no afecta acceso
        type,
        data: {
          questions,
          anagrams,
        },
      });

      setSubmitted(false);
      setScore(null);
      setCurrentIndex(0);

      if (type === "quiz") {
        setAnswers(Array(questions.length).fill(null));
        answersRef.current = Array(questions.length).fill(null);
        setScrambledWords([]);
        setSlotPlacements([]);
        setAnsweredQuestions(Array(questions.length).fill(false));
        setGlobalStartTime(null);
        setGlobalElapsed(0);
      } else {
        const scrambled = anagrams.map((item) => buildScrambledWord(item.word));
        setAnswers(Array(anagrams.length).fill(""));
        answersRef.current = Array(anagrams.length).fill("");
        setScrambledWords(scrambled);
        setSlotPlacements(anagrams.map((item) => buildSlotTemplate(item.word)));
        setAnsweredQuestions([]);
        setGlobalStartTime(null);
        setGlobalElapsed(0);
      }
    }

    load();
  }, [id, router]);

  useEffect(() => {
    if (!confirmedName || !activity) return;
    setGlobalStartTime((prev) => prev ?? Date.now());
  }, [confirmedName, activity]);

  useEffect(() => {
    if (!globalStartTime || submitted) {
      return;
    }

    setGlobalElapsed(Date.now() - globalStartTime);
    const interval = window.setInterval(() => {
      setGlobalElapsed(Date.now() - globalStartTime);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [globalStartTime, submitted]);

  useEffect(() => {
    return () => {
      if (quizAdvanceTimeout.current) {
        window.clearTimeout(quizAdvanceTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    if (
      !activity ||
      activity.type !== "anagram" ||
      submitted ||
      slotPlacements.length === 0
    ) {
      autoAdvanceRef.current = null;
      return;
    }

    const totalWords = activity.data.anagrams.length;
    if (totalWords === 0 || currentIndex >= totalWords) return;

    const slots = slotPlacements[currentIndex] ?? [];
    const assembled = buildWordFromSlots(slots);
    const target = activity.data.anagrams[currentIndex]?.word ?? "";
    const isSolved =
      normalizeWord(assembled) === normalizeWord(target);

    if (!isSolved) {
      if (autoAdvanceRef.current === currentIndex) {
        autoAdvanceRef.current = null;
      }
      return;
    }

    if (currentIndex >= totalWords - 1) return;
    if (autoAdvanceRef.current === currentIndex) return;

    autoAdvanceRef.current = currentIndex;

    const timer = window.setTimeout(() => {
      const nextIndex = Math.min(totalWords - 1, currentIndex + 1);

      if (nextIndex === currentIndex) {
        const allSolved = slotPlacements.every((placements, idx) => {
          const built = buildWordFromSlots(placements ?? []);
          const expected = activity.data.anagrams[idx]?.word ?? "";
          return normalizeWord(built) === normalizeWord(expected);
        });

        if (allSolved) {
          submitAnswers();
        } else {
          setCurrentIndex(nextIndex);
        }
      } else {
        setCurrentIndex(nextIndex);
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [activity, slotPlacements, currentIndex, submitted, submitAnswers]);

  useEffect(() => {
    if (
      submitted ||
      !activity ||
      activity.type !== "anagram" ||
      slotPlacements.length === 0
    ) {
      return;
    }

    const allSolved =
      slotPlacements.length === activity.data.anagrams.length &&
      slotPlacements.every((placements, idx) => {
        const built = buildWordFromSlots(placements ?? []);
        const expected = activity.data.anagrams[idx]?.word ?? "";
        return normalizeWord(built) === normalizeWord(expected);
      });

    if (allSolved) {
      submitAnswers();
    }
  }, [activity, slotPlacements, submitted, submitAnswers]);

  useEffect(() => {
    if (
      submitted ||
      !activity ||
      activity.type !== "quiz" ||
      answeredQuestions.length === 0
    ) {
      return;
    }

    const totalQuestions = activity.data.questions.length;
    if (totalQuestions === 0) return;

    const allAnswered =
      answeredQuestions.length === totalQuestions &&
      answeredQuestions.every(Boolean);

    if (!allAnswered) return;

    const timer = window.setTimeout(() => {
      submitAnswers();
    }, 1400);

    return () => window.clearTimeout(timer);
  }, [activity, answeredQuestions, submitted, submitAnswers]);

  // Seleccionar una respuesta
  function selectAnswer(qIndex: number, optIndex: number) {
    if (submitted || activity?.type !== "quiz") return; // No permitir cambiar después de enviar
    if (answeredQuestions[qIndex]) return;

    const updatedAnswers = answers.slice();
    updatedAnswers[qIndex] = optIndex;
    setAnswers(updatedAnswers);
    answersRef.current = updatedAnswers;

    const totalQuestions = activity?.data.questions.length ?? 0;
    const base =
      answeredQuestions.length === totalQuestions
        ? [...answeredQuestions]
        : Array(totalQuestions).fill(false);
    base[qIndex] = true;
    setAnsweredQuestions(base);
    const allAnswered =
      totalQuestions > 0 && base.length === totalQuestions && base.every(Boolean);

    if (quizAdvanceTimeout.current) {
      window.clearTimeout(quizAdvanceTimeout.current);
    }

    if (qIndex >= totalQuestions - 1) {
      return;
    }

    quizAdvanceTimeout.current = window.setTimeout(() => {
      if (!activity || activity.type !== "quiz") return;
      setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1));
    }, 1400);
  }

  const syncAnswerWithSlots = useCallback(
    (wordIndex: number, slots: (SlotPlacement | null)[]) => {
      const built = buildWordFromSlots(slots);

      setAnswers((prev) => {
        const copy = [...prev];
        copy[wordIndex] = built;
        answersRef.current = copy;
        return copy;
      });
    },
    []
  );

  const updateSlotsForWord = useCallback(
    (
      wordIndex: number,
      updater: (
        current: (SlotPlacement | null)[]
      ) => (SlotPlacement | null)[]
    ) => {
      if (!activity || activity.type !== "anagram") return;
      let updated: (SlotPlacement | null)[] | null = null;

      setSlotPlacements((prev) => {
        const totalWords = activity.data.anagrams.length;
        const next = Array.from({ length: totalWords }, (_, idx) => [
          ...(prev[idx] ?? []),
        ]);

        const targetLength = getNormalizedLetters(
          activity.data.anagrams[wordIndex]?.word ?? ""
        ).length;

        const base =
          next[wordIndex].length === targetLength
            ? [...next[wordIndex]]
            : Array.from({ length: targetLength }, () => null);

        updated = updater(base);
        next[wordIndex] = updated!;
        return next;
      });

      if (updated) {
        syncAnswerWithSlots(wordIndex, updated);
      }
    },
    [activity, syncAnswerWithSlots]
  );

  const findNextEmptySlot = useCallback(
    (wordIndex: number) => {
      const slots = slotPlacements[wordIndex] ?? [];
      return slots.findIndex((slot) => slot === null);
    },
    [slotPlacements]
  );

  const placeLetterInSlot = useCallback(
    (wordIndex: number, letterIndex: number, slotIndex: number) => {
      if (!activity || activity.type !== "anagram") return;
      const letters = scrambledWords[wordIndex] ?? [];
      const slots = slotPlacements[wordIndex] ?? [];
      const isUsed = slots.some(
        (slot) => slot && slot.sourceIndex === letterIndex
      );

      if (isUsed) return;
      if (slots[slotIndex]) return;

      const letter = letters[letterIndex];
      const targetLetters = getNormalizedLetters(
        activity.data.anagrams[wordIndex]?.word ?? ""
      );
      const expected = targetLetters[slotIndex];

      if (!letter || !expected) return;

      if (normalizeChar(letter) !== normalizeChar(expected)) {
        toast.error("Esa letra no va en esta posición");
        return;
      }

      updateSlotsForWord(wordIndex, (slots) => {
        const next = [...slots];
        next[slotIndex] = { letter, sourceIndex: letterIndex };
        return next;
      });
    },
    [activity, scrambledWords, slotPlacements, updateSlotsForWord]
  );

  const handleLetterClick = useCallback(
    (wordIndex: number, letterIndex: number) => {
      if (submitted || activity?.type !== "anagram") return;
      const targetSlot = findNextEmptySlot(wordIndex);
      if (targetSlot === -1) return;
      placeLetterInSlot(wordIndex, letterIndex, targetSlot);
    },
    [submitted, activity, findNextEmptySlot, placeLetterInSlot]
  );

  const handleTypedLetter = useCallback(
    (value: string) => {
      if (submitted || activity?.type !== "anagram") return;
      const slotIndex = findNextEmptySlot(currentIndex);
      if (slotIndex === -1) return;

      const lettersPool = scrambledWords[currentIndex] ?? [];
      const currentSlots = slotPlacements[currentIndex] ?? [];
      const usedIndices = currentSlots
        .map((slot) => slot?.sourceIndex)
        .filter((idx) => typeof idx === "number" && idx >= 0);

      const targetLetters = getNormalizedLetters(
        activity.data.anagrams[currentIndex]?.word ?? ""
      );
      const expected = targetLetters[slotIndex];

      if (!expected) return;

      const letter = value.toUpperCase();
      if (normalizeChar(letter) !== normalizeChar(expected)) {
        toast.error("Esa letra no corresponde a esa posición");
        return;
      }

      const letterIndex = lettersPool.findIndex(
        (candidate, idx) =>
          !usedIndices.includes(idx) &&
          normalizeChar(candidate) === normalizeChar(letter)
      );

      if (letterIndex === -1) {
        toast.error("No quedan fichas con esa letra disponible");
        return;
      }

      updateSlotsForWord(currentIndex, (slots) => {
        const next = [...slots];
        next[slotIndex] = { letter, sourceIndex: letterIndex };
        return next;
      });
    },
    [
      submitted,
      activity,
      currentIndex,
      scrambledWords,
      slotPlacements,
      findNextEmptySlot,
      updateSlotsForWord,
    ]
  );

  const handleUndoLetter = useCallback(
    (wordIndex: number) => {
      if (submitted || activity?.type !== "anagram") return;
      updateSlotsForWord(wordIndex, (slots) => {
        const next = [...slots];
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i]) {
            next[i] = null;
            break;
          }
        }
        return next;
      });
    },
    [submitted, activity, updateSlotsForWord]
  );

  const handleResetWord = useCallback(
    (wordIndex: number) => {
      if (submitted || activity?.type !== "anagram") return;
      updateSlotsForWord(wordIndex, (slots) => slots.map(() => null));
    },
    [submitted, activity, updateSlotsForWord]
  );

  const handleSlotClick = useCallback(
    (wordIndex: number, slotIndex: number) => {
      if (submitted || activity?.type !== "anagram") return;
      updateSlotsForWord(wordIndex, (slots) => {
        const next = [...slots];
        next[slotIndex] = null;
        return next;
      });
    },
    [submitted, activity, updateSlotsForWord]
  );

  const handleSlotDrop = useCallback(
    (wordIndex: number, slotIndex: number, event: DragEvent<HTMLDivElement>) => {
      if (submitted || activity?.type !== "anagram") return;
      event.preventDefault();
      const data = event.dataTransfer.getData("text/plain");
      const letterIndex = Number.parseInt(data, 10);
      if (Number.isNaN(letterIndex)) return;
      placeLetterInSlot(wordIndex, letterIndex, slotIndex);
    },
    [submitted, activity, placeLetterInSlot]
  );

  const handleLetterDragStart = useCallback(
    (event: DragEvent<HTMLButtonElement>, letterIndex: number) => {
      if (submitted || activity?.type !== "anagram") return;
      event.dataTransfer.setData("text/plain", letterIndex.toString());
      event.dataTransfer.effectAllowed = "move";
    },
    [submitted, activity]
  );

  useEffect(() => {
    if (
      !activity ||
      activity.type !== "anagram" ||
      !confirmedName ||
      submitted
    ) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA")
      ) {
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        handleUndoLetter(currentIndex);
        return;
      }

      if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚ]$/.test(event.key)) {
        event.preventDefault();
        handleTypedLetter(event.key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activity,
    confirmedName,
    submitted,
    currentIndex,
    handleTypedLetter,
    handleUndoLetter,
  ]);

  function goToPrevious() {
    if (currentIndex === 0) return;
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  function goToNext() {
    if (currentIndex >= totalItems - 1) return;
    setCurrentIndex((prev) => Math.min(totalItems - 1, prev + 1));
  }

  // Guardar resultado en Firestore
  async function saveAttempt(
    correctCount: number,
    attemptAnswers: (number | string | null)[]
  ) {
    if (!studentName.trim() || !activity) return;

    const totalItems =
      activity.type === "quiz"
        ? activity.data.questions.length
        : activity.data.anagrams.length;

    const elapsedMs = globalStartTime ? Date.now() - globalStartTime : null;

    const attempt = {
      name: studentName.trim(),
      answers: attemptAnswers,
      correct: correctCount,
      total: totalItems,
      percentage:
        totalItems === 0
          ? 0
          : Math.round((correctCount / totalItems) * 100),
      type: activity.type,
      createdAt: serverTimestamp(),
      ...(typeof elapsedMs === "number" ? { durationMs: elapsedMs } : {}),
    };

    try {
      await addDoc(
        collection(db, "activities", activity.id, "attempts"),
        attempt
      );
    } catch (err) {
      console.error(err);
      toast.error("Error guardando resultados");
    }
  }
  // PANTALLA 1 — Pedir nombre
  if (!confirmedName) {
    return (
      <>
        <main className="flex-1">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <AuthCard title="Antes de comenzar">

              <div className="space-y-4">
                <Input
                  label="Introduce tu nombre para continuar:"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                />



                <Button
                  full
                  onClick={() => {
                    if (!studentName.trim()) {
                      toast.error("Escribe tu nombre");
                      return;
                    }
                    setConfirmedName(true);
                  }}
                >
                  Empezar actividad
                </Button>
              </div>
            </AuthCard>
          </div>
        </main>
      </>
    );
  }

  if (!activity) return <p className="p-8">Cargando...</p>;

  // PANTALLA 2 — Actividad interactiva
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <p className="text-sm text-gray-500 mb-1">
          Alumno: <strong>{studentName}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-4">
          Tiempo transcurrido: <strong>{formatTime(globalElapsed)}</strong>
        </p>

        {!submitted && (
          <>
            {/* LISTA DE PREGUNTAS / ANAGRAMAS */}
            {(() => {
              if (totalItems === 0) {
                return (
                  <p className="text-gray-500">
                    Esta actividad aún no tiene contenido configurado.
                  </p>
                );
              }

          if (activity.type === "quiz" && currentQuestion) {
            return (
              <div className="border p-4 rounded-lg mb-4 bg-white">
                <p className="text-sm text-gray-600 mb-2">
                  Pregunta {currentIndex + 1} de {totalItems}
                </p>
                <h3 className="font-semibold mb-2">{currentQuestion.question}</h3>

                <ul className="space-y-2">
                  {currentQuestion.options.map((opt, j) => {
                    const isSelected = answers[currentIndex] === j;
                    const showFeedback =
                      submitted || answeredQuestions[currentIndex];
                    const isCorrect =
                      showFeedback && j === currentQuestion.correctIndex;
                    const isWrong =
                      showFeedback &&
                      isSelected &&
                      j !== currentQuestion.correctIndex;

                    return (
                      <li
                        key={j}
                        onClick={() => selectAnswer(currentIndex, j)}
                            className={`
                              p-2 border rounded-lg cursor-pointer
                              transition
                              ${isSelected && !submitted ? "bg-blue-100 border-blue-500" : ""}
                              ${isCorrect ? "bg-green-200 border-green-600" : ""}
                              ${isWrong ? "bg-red-200 border-red-600" : ""}
                            `}
                          >
                        {opt}
                      </li>
                    );
                  })}
                </ul>

                {(() => {
                  const showFeedback =
                    submitted || answeredQuestions[currentIndex];
                  if (!showFeedback) return null;
                  const userIndex = answers[currentIndex] as number | null;
                  const correct =
                    userIndex !== null &&
                    userIndex === currentQuestion.correctIndex;
                  return (
                    <p
                      className={`mt-3 font-semibold ${correct ? "text-green-600" : "text-red-600"
                        }`}
                    >
                      {correct
                        ? "¡Respuesta correcta!"
                        : "Respuesta incorrecta"}
                    </p>
                  );
                })()}
              </div>
            );
          }

              if (activity.type === "anagram" && currentAnagram) {
                const letters = scrambledWords[currentIndex] ?? [];
                const slots = slotPlacements[currentIndex] ?? [];
                const hasSelection = slots.some((slot) => slot !== null);
                const assembledWord = buildWordFromSlots(slots);
                const isSolved =
                  normalizeWord(assembledWord) ===
                  normalizeWord(currentAnagram.word ?? "");

                return (
                  <div className="border p-4 rounded-lg mb-4 bg-white">
                    <p className="text-sm text-gray-600 mb-2">
                      Palabra {currentIndex + 1} de {totalItems}
                    </p>
                    <h3 className="font-semibold mb-1">Ordena las letras</h3>
                    <p className="text-sm text-gray-600">
                      Puedes pulsar, arrastrar o escribir para completar la palabra.
                    </p>

                    {currentAnagram.hint?.trim() ? (
                      <p className="text-sm text-gray-600 mt-2">
                        Pista: {currentAnagram.hint}
                      </p>
                    ) : null}

                    <div className="mt-4 flex flex-wrap gap-2">
                      {letters.length === 0 ? (
                        <p className="text-gray-500">Preparando letras...</p>
                      ) : (
                        letters.map((letter, j) => {
                          const isUsed = slots.some(
                            (slot) => slot?.sourceIndex === j
                          );
                          if (isUsed) return null;
                          return (
                            <button
                              key={j}
                              type="button"
                              disabled={submitted}
                              draggable={!submitted}
                              onDragStart={(event) =>
                                handleLetterDragStart(event, j)
                              }
                              onClick={() => handleLetterClick(currentIndex, j)}
                              className="px-3 py-2 border rounded text-lg font-semibold uppercase transition bg-white hover:bg-blue-50 border-gray-300"
                            >
                              {letter}
                            </button>
                          );
                        })
                      )}
                    </div>

                    <div className="mt-6">
                      <p className="text-sm text-gray-600 mb-2">
                        Coloca las letras en cada casilla:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {slots.length === 0 ? (
                          <p className="text-gray-500">
                            Esta palabra no tiene letras configuradas.
                          </p>
                        ) : (
                          slots.map((slot, slotIndex) => (
                            <div
                              key={slotIndex}
                              onClick={() => handleSlotClick(currentIndex, slotIndex)}
                              onDragOver={(event) => event.preventDefault()}
                              onDrop={(event) =>
                                handleSlotDrop(currentIndex, slotIndex, event)
                              }
                              className={`w-12 h-16 border-2 rounded flex items-center justify-center text-2xl font-semibold tracking-wider cursor-pointer transition ${
                                slot
                                  ? "bg-blue-50 border-blue-500 text-blue-600"
                                  : "bg-gray-50 border-dashed border-gray-400 text-gray-400"
                              }`}
                            >
                              {slot?.letter ?? ""}
                            </div>
                          ))
                        )}
                      </div>

                      {isSolved && (
                        <p className="text-xs text-green-600 mt-2">
                          ¡Palabra completada!
                        </p>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleUndoLetter(currentIndex)}
                        disabled={!hasSelection}
                      >
                        Deshacer letra
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => handleResetWord(currentIndex)}
                        disabled={!hasSelection}
                      >
                        Reiniciar palabra
                      </Button>
                    </div>
                  </div>
                );
              }

              return null;
            })()}

            {totalItems > 0 && (
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="secondary"
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                >
                  Anterior
                </Button>

                {currentIsLast ? (
                  <Button
                    onClick={() => {
                      if (!submitted) submitAnswers();
                    }}
                    disabled={
                      submitted ||
                      (!submitted &&
                        activity?.type === "quiz" &&
                        !currentHasAnswer)
                    }
                  >
                    {submitted ? "Actividad enviada" : "Enviar respuestas"}
                  </Button>
                ) : (
                  <Button
                    onClick={goToNext}
                    disabled={
                      !submitted &&
                      activity?.type === "quiz" &&
                      !currentHasAnswer
                    }
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {submitted && (
          <div className="text-center mt-6">
            <h2 className="text-xl font-bold">
              Resultado: {score} / {totalItems}
            </h2>

            <p className="text-gray-600 mt-2">
              {(() => {
                const safeScore = score ?? 0;

                if (totalItems === 0) return "Sin ejercicios disponibles.";

                if (safeScore === totalItems) return "¡Perfecto! 🎉";

                if (safeScore >= totalItems / 2) return "¡Buen trabajo! 👍";

                return "Sigue practicando 💪";
              })()}
            </p>
          </div>
        )}

        {submitted && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">
              Detalle de tus respuestas
            </h3>

            {activity.type === "quiz" ? (
              <div className="space-y-4">
                {activity.data.questions.map((question, index) => {
                  const userIndex = answers[index] as number | null;
                  const isCorrect = userIndex === question.correctIndex;

                  return (
                    <div
                      key={index}
                      className={`border rounded p-4 ${isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                        }`}
                    >
                      <p className="font-semibold">
                        Pregunta {index + 1}: {question.question}
                      </p>
                      <ul className="space-y-2 mt-3">
                        {question.options.map((option, optIndex) => {
                          const isSelected = userIndex === optIndex;
                          const isOptionCorrect =
                            optIndex === question.correctIndex;
                          return (
                            <li
                              key={optIndex}
                              className={`p-2 rounded border ${isOptionCorrect
                                ? "bg-green-200 border-green-600"
                                : isSelected
                                  ? "bg-red-200 border-red-600"
                                  : "bg-white border-gray-300"
                                }`}
                            >
                              {option || "—"}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {activity.data.anagrams.map((item, index) => {
                  const userAnswer = (answers[index] as string) ?? "";
                  const isCorrect =
                    normalizeWord(userAnswer) ===
                    normalizeWord(item.word ?? "");

                  return (
                    <div
                      key={index}
                      className={`border rounded p-4 ${isCorrect ? "border-green-500 bg-green-50" : "border-red-500 bg-red-50"
                        }`}
                    >
                      <p className="font-semibold">
                        Palabra {index + 1}
                      </p>
                      <p className="text-sm text-gray-600">
                        Solución: <strong>{item.word}</strong>
                      </p>
                      <p className="text-sm mt-1">
                        Tu respuesta:{" "}
                        <strong>{userAnswer || "Sin completar"}</strong>
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-red-600 mt-1">
                          Revisa esta palabra y vuelve a intentarlo.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
