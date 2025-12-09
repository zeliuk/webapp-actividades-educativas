export default function Header() {
    return (
        <footer className="border-t py-6 mt-12">
            <div className="max-w-6xl mx-auto px-4 text-sm text-gray-600">
                © {new Date().getFullYear()} EduApp - Todos los derechos reservados
            </div>
        </footer>
    );
}