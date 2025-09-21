import { FastifyReply } from 'fastify';

export function handleError(reply: FastifyReply, error: unknown, message: string) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return reply.code(500).send({
    error: 'Internal Server Error',
    message,
    details: errorMessage,
    timestamp: new Date().toISOString()
  });
}

