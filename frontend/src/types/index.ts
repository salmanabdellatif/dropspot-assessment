export interface User {
    id: number;
    email: string;
    is_admin: boolean;
    created_at?: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;
}

export interface Drop {
    id: number;
    name: string;
    description: string;
    stock_count: number;
    status: 'upcoming' | 'active' | 'ended';
    starts_at: string;
    ends_at: string;
}