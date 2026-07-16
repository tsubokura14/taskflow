import Link from "next/link";

export function DummyLogin() {
    return (
        <div className="flex items-center justify-center h-screen p-8 bg-gray-50">
            <div className="flex flex-col items-center gap-4 rounded-xl border border-gray-200 bg-white p-8 w-72">
                <h2 className="text-lg font-semibold text-gray-900">ログイン（テスト）</h2>
                <Link href="/workspaces" className="w-full">
                    <button
                        className="w-full rounded-lg border border-gray-300 bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                    >
                        ログイン
                    </button>
                </Link>
            </div>
        </div>
    )
}