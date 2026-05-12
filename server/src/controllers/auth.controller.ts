import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { InvalidCredentialsError } from '../errors/auth/InvalidCredentialsError';
import { InvalidEmailError } from '../errors/auth/InvalidEmailError';
import { InvalidTokenError } from '../errors/auth/InvalidTokenError';
import { UserAlreadyRegisteredError } from '../errors/auth/UserAlreadyRegisteredError';
import { UserNotFoundError } from '../errors/auth/UserNotFoundError';
import { WeakPasswordError } from '../errors/auth/WeakPasswordError';
import { AuthService } from '../services/auth.service';

export const register = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;
    try {
        const result = await AuthService.registerUser(email, password, name);
        res.status(StatusCodes.CREATED).json(result);
    } catch (error) {
        if (error instanceof InvalidEmailError || error instanceof WeakPasswordError || error instanceof UserAlreadyRegisteredError) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: error.message });
        } else {
            console.error('Erro no registro:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
        }
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    try {
        const result = await AuthService.loginUser(email, password);
        res.json(result);
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
        } else {
            console.error('Erro no login:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
        }
    }
};

export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Usuário não autenticado' });

        return;
    }

    try {
        const user = await AuthService.getUserById(userId);
        res.json(user);
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
        } else {
            console.error('Erro ao buscar usuário:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
        }
    }
};

export const validateToken = async (req: Request, res: Response): Promise<void> => {
    const userId = req.userId;
    if (!userId) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token inválido ou expirado' });

        return;
    }

    try {
        const user = await AuthService.getUserFromTokenPayload(userId);
        res.json({ user });
    } catch (error) {
        if (error instanceof UserNotFoundError) {
            res.status(StatusCodes.NOT_FOUND).json({ message: error.message });
        } else {
            console.error('Erro ao validar token:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
        }
    }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const oldToken = authHeader && authHeader.split(' ')[1];

    if (!oldToken) {
        res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Token não fornecido' });

        return;
    }

    try {
        const newToken = AuthService.refreshToken(oldToken);
        res.json({ token: newToken });
    } catch (error) {
        if (error instanceof InvalidTokenError) {
            res.status(StatusCodes.FORBIDDEN).json({ message: error.message });
        } else {
            console.error('Erro ao renovar token:', error);
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Erro no servidor' });
        }
    }
};
