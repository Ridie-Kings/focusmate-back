export interface JwtPayload {
  sub: string; // ID del usuario en MongoDB
  email: string; // Email del usuario
  iat?: number; // (Opcional) Timestamp de creación del token
  exp?: number; // (Opcional) Timestamp de expiración del token
}
