import { User } from "@/types";
import { userFixtures } from "@/lib/user.fixtures";

// --- ports ---
export type GetUserInput = {
    password: string;
    name: string;
}
export type CreateUserInput = {
    password: string;
    name: string;
}
export type UpdateUserInput = {
    id: string;
    password: string;
    name: string;
}


// DBから受け取る型
export type UserRow = {
    id: string,
    password: string,
    name: string,
    deleted_at: string | null
}

/**
 * ストアとDB/スタブの受け渡しに使用
 * DBとスタブの不整合を防ぐ役割
 */
export type UserApi = {
    getUser: (input: GetUserInput) => Promise<User | null>;
    createUser: (input: CreateUserInput) => Promise<User>;
    updateUser: (input: UpdateUserInput) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
};

// Mapper
function rowToUser(row: UserRow): User {
    return {
        id: row.id,
        name: row.name,
    }
}

// スタブ使用時の暫定的な永続化先（再代入により模擬的にDBの役割を果たす）
let users: UserRow[] = userFixtures;

// --- スタブ・Adapters ---
const stubUserApi = {
    getUser: async (input: GetUserInput) => {
        const row = users
            .find((row) => row.name === input.name
                && row.password === input.password
                && row.deleted_at === null)

        return row ? rowToUser(row) : null;
    },

    createUser: async (input: CreateUserInput) => {
        const newUser: UserRow = {
            id: crypto.randomUUID(),
            name: input.name,
            password: input.password,
            deleted_at: null,
        }

        users = [...users, newUser];

        return rowToUser(newUser);
    },

    updateUser: async (input: UpdateUserInput) => {
        const target: UserRow | undefined = users
            .find((row) => row.id === input.id);
        if (!target) {
            throw new Error("対象のユーザーが見つかりませんでした。");
        }

        const newUser: UserRow = {
            ...target,
            name: input.name,
            password: input.password,
        };

        users = users
            .map((row) => row.id === input.id ? newUser : row);

        return rowToUser(newUser);
    },

    deleteUser: async (id: string) => {
        const target: UserRow | undefined = users
            .find((row) => row.id === id);
        if (!target) {
            throw new Error("対象のユーザーが見つかりませんでした。");
        }

        const newUser: UserRow = {
            ...target,
            deleted_at: new Date().toISOString(),
        };

        users = users
            .map((row) => row.id === id ? newUser : row);
    },
} satisfies UserApi;

export const userApi = stubUserApi;
