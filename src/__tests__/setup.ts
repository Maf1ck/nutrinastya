import { config } from '@vue/test-utils'
import { vReveal } from '@/directives/reveal'

// глобальна директива, яку в застосунку реєструє main.ts
config.global.directives = { reveal: vReveal }
