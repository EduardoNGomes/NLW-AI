import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import { prisma } from '../lib/prisma'
import { fastifyMultipart } from '@fastify/multipart'

import path from 'node:path'
import fs from 'node:fs'
import { randomUUID } from 'node:crypto'
import { pipeline } from 'node:stream'
import { promisify } from 'node:util'
const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_48_576 * 25, // 25mb
    },
  })
  app.post('/videos', async (req: FastifyRequest, reply: FastifyReply) => {
    const data = await req.file()

    if (!data) return reply.status(400).send({ error: 'Missing file input' })

    const extension = path.extname(data.filename)

    if (extension !== '.mp3') {
      return reply
        .status(400)
        .send({ error: 'Invalid input type, please upload a MP3' })
    }

    const fileBaseName = path.basename(data.fieldname, extension)

    const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`

    const uploadDestination = path.resolve(
      __dirname,
      '../../tmp',
      fileUploadName,
    )

    await pump(data.file, fs.createWriteStream(uploadDestination))

    const video = await prisma.video.create({
      data: {
        name: data.filename,
        path: uploadDestination,
      },
    })

    return reply.status(201).send({ video })
  })
}
