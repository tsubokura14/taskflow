import Link from "next/link"

export default function ProjectsPage() {
    const sampleProject: string[] = [
        "サンプルプロジェクト１",
        "サンプルプロジェクト２",
        "サンプルプロジェクト３",
        "サンプルプロジェクト４",
        "サンプルプロジェクト５",
        "サンプルプロジェクト６",
        "サンプルプロジェクト７",
        "サンプルプロジェクト８",
        "サンプルプロジェクト９"
    ];

    return (
        <div className="flex flex-col items-center min-h-screen p-8 bg-gray-50">
            <div className="flex justify-between w-full">
                <Link href="/workspaces/projects/new" >
                    <button
                        className="mb-4 w-24 border border-gray-300 rounded-lg py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        作成
                    </button>
                </Link>
                {/* <label>
                    検索：
                    <input type="text" />
                </label> */}
            </div>
            <div className="grid grid-cols-3 gap-2 w-full">
                {sampleProject.map((name) => (
                    <div key={name} className="flex justify-between w-full border border-gray-200 rounded-xl p-4 bg-white">
                        <Link href="/workspaces/projects/board">
                            <button>{name}</button>
                        </Link>
                        <Link href="/workspaces/projects/settings">
                            <button>設定</button>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    )
}