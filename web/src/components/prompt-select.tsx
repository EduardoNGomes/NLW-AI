import { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { api } from '@/lib/axios'

interface Prompt {
  id: string
  title: string
  template: string
}

interface PromptSelectProps {
  onPromptSelected: (template: string) => void
}

export function PromptSelect({ onPromptSelected }: PromptSelectProps) {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null)

  function handlePromptSelected(id: string) {
    const selectedPrompt = prompts?.find((prompt) => prompt.id === id)

    if (!selectedPrompt) return

    onPromptSelected(selectedPrompt.template)
  }

  useEffect(() => {
    api
      .get('/prompts')
      .then((res) => setPrompts(res.data))
      .catch((error) => console.error(error))
  }, [])

  return (
    <Select onValueChange={handlePromptSelected}>
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {prompts?.map((prompt) => {
          return (
            <SelectItem value={prompt.id} key={prompt.id}>
              {prompt.title}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
