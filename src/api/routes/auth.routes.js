export default async function authRoutes(fastify, options) {
    fastify.post("/login", async (request, reply) => {
        if (!request.body || !request.body.userId) {
            return reply.status(400).send({ error: "userId is required" });
        }

        const { userId } = request.body;

        // Stub: In a real app, verify OTP/Password against DB here
        const token = fastify.jwt.sign({ userId });

        return reply.send({ token });
    });
}
