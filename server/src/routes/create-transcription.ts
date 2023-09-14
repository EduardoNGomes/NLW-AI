import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma'
import { z } from 'zod'
import { openai } from '../lib/openai'

import { createReadStream } from 'node:fs'

export async function createTranscriptionRoute(app: FastifyInstance) {
  app.post(
    '/videos/:videoId/transcription',
    async (req: FastifyRequest, reply: FastifyReply) => {
      const paramsSchema = z.object({
        videoId: z.string().uuid(),
      })
      const bodySchema = z.object({
        prompt: z.string(),
      })

      const { videoId } = paramsSchema.parse(req.params)
      const { prompt } = bodySchema.parse(req.body)

      const video = await prisma.video.findUniqueOrThrow({
        where: {
          id: videoId,
        },
      })

      const videoPath = video.path

      const audioReadStream = createReadStream(videoPath)

      const response = await openai.audio.transcriptions.create({
        file: audioReadStream,
        model: 'whisper-1',
        language: 'pt',
        response_format: 'json',
        temperature: 0,
        prompt,
      })

      await prisma.video.update({
        where: {
          id: videoId,
        },
        data: {
          transcription: response.text,
        },
      })

      return reply.status(201).send({ text: response.text })
    },
  )
}
