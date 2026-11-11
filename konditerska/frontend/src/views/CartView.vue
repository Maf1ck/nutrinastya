<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '@/api/client'
import { shopApi } from '@/api/shop'
import AppButton from '@/components/ui/AppButton.vue'
import FormField from '@/components/ui/FormField.vue'
import QuantityStepper from '@/components/ui/QuantityStepper.vue'
import SegmentedToggle from '@/components/ui/SegmentedToggle.vue'
import { formatPrice, pluralize, STATE_LABELS } from '@/composables/useFormat'
import { useCartStore } from '@/stores/cart'
import { useSiteStore } from '@/stores/site'
import type { CartLine, ProductState } from '@/types'

const cart = useCartStore()
const site = useSiteStore()
const router = useRouter()

const form = reactive({
  website: '', // honeypot, must stay empty
  customerName: '',
  phone: '',
  pickupPointId: '',
  pickupDate: '',
  pickupTime: '',
  comment: '',
})
const errors = ref<Record<string, string>>({})
const submitError = ref('')
const submitting = ref(false)

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
const minDate = todayIso()

const itemsLabel = computed(() => `${cart.lineCount} ${pluralize(cart.lineCount, ['позиція', 'позиції', 'позицій'])}`)

function stateOptions(line: CartLine) {
  return [
    { value: 'fresh' as const, label: STATE_LABELS.fresh, disabled: !line.hasFresh },
    { value: 'frozen' as const, label: STATE_LABELS.frozen, disabled: !line.hasFrozen },
  ]
}

function changeState(line: CartLine, state: ProductState): void {
  cart.setState(line, state)
}

function validate(): Record<string, string> {
  const result: Record<string, string> = {}
  if (form.customerName.trim().length < 2) result.customerName = 'Введіть ім’я'
  if (!/^(\+?38)?0\d{9}$/.test(form.phone.replace(/[\s()-]/g, ''))) {
    result.phone = 'Вкажіть номер у форматі +380XXXXXXXXX'
  }
  if (!form.pickupPointId) result.pickupPointId = 'Оберіть адресу самовивозу'
  if (!form.pickupDate) result.pickupDate = 'Оберіть дату'
  else if (form.pickupDate < minDate) result.pickupDate = 'Дата вже минула'
  if (!form.pickupTime) result.pickupTime = 'Оберіть час'
  return result
}

async function submit(): Promise<void> {
  submitError.value = ''
  errors.value = validate()
  if (Object.keys(errors.value).length || !cart.lineCount) return

  submitting.value = true
  try {
    const result = await shopApi.createOrder({
      website: form.website,
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      pickupPointId: Number(form.pickupPointId),
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      comment: form.comment.trim(),
      items: cart.lines.map((line) => ({ productId: line.productId, state: line.state, qty: line.qty })),
    })
    cart.clear()
    await router.push({ name: 'order-success', query: { n: String(result.id) } })
  } catch (cause) {
    if (cause instanceof ApiError) {
      errors.value = cause.fields
      submitError.value = cause.message
    } else {
      submitError.value = 'Не вдалося оформити замовлення. Спробуйте ще раз'
    }
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  document.title = `Кошик — ${site.settings?.brandName ?? ''}`
  try {
    cart.sync(await shopApi.products())
  } catch {
    // Offline or API error: keep the cached cart, the server re-checks prices on submit.
  }
})
</script>

<template lang="pug">
.page.container
  header.page__head
    h1.page__title Кошик
    p.page__count(v-if="cart.lineCount") {{ itemsLabel }}

  .empty(v-if="!cart.lineCount")
    p.empty__text Ваш кошик порожній.
    app-button(:to="{ name: 'catalog' }") Перейти до каталогу

  form.layout(v-else novalidate @submit.prevent="submit")
    .layout__main
      section.panel(aria-labelledby="items-title")
        h2.panel__title#items-title Ваше замовлення
        transition-group.items(tag="ul" name="line")
          li.item(v-for="line in cart.lines" :key="`${line.productId}:${line.state}`")
            .item__photo
              img(v-if="line.imageUrl" :src="line.imageUrl" :alt="line.name" loading="lazy")
            .item__info
              h3.item__name {{ line.name }}
              p.item__price-mobile {{ formatPrice(line.price) }}
            segmented-toggle.item__state(
              :model-value="line.state"
              :options="stateOptions(line)"
              :label="`Стан: ${line.name}`"
              size="sm"
              @update:model-value="changeState(line, $event)"
            )
            quantity-stepper.item__qty(
              :model-value="line.qty"
              :name="line.name"
              @update:model-value="cart.setQty(line, $event)"
            )
            p.item__total {{ formatPrice(line.price * line.qty) }}

      section.panel(aria-labelledby="data-title")
        h2.panel__title#data-title Дані для замовлення
        .form-grid
          .trap(aria-hidden="true")
            label Не заповнюйте це поле
              input(v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off")
          form-field(label="Ім’я" :error="errors.customerName" v-slot="{ id, invalid, describedBy }")
            input(:id="id" v-model="form.customerName" type="text" autocomplete="name" maxlength="80" placeholder="Як до вас звертатися" :aria-invalid="invalid" :aria-describedby="describedBy")
          form-field(label="Телефон" :error="errors.phone" v-slot="{ id, invalid, describedBy }")
            input(:id="id" v-model="form.phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20" placeholder="+380" :aria-invalid="invalid" :aria-describedby="describedBy")
          form-field(label="Отримання" v-slot="{ id }")
            input(:id="id" type="text" value="Самовивіз (єдиний спосіб)" disabled)
          form-field(label="Адреса самовивозу" :error="errors.pickupPointId" v-slot="{ id, invalid, describedBy }")
            select(:id="id" v-model="form.pickupPointId" :aria-invalid="invalid" :aria-describedby="describedBy")
              option(value="" disabled) Оберіть адресу з {{ site.pickupCount }}
              option(v-for="point in site.pickupPoints" :key="point.id" :value="String(point.id)") {{ point.name }} — {{ point.address }}
          form-field(label="Дата" :error="errors.pickupDate" v-slot="{ id, invalid, describedBy }")
            input(:id="id" v-model="form.pickupDate" type="date" :min="minDate" :aria-invalid="invalid" :aria-describedby="describedBy")
          form-field(label="Час" :error="errors.pickupTime" v-slot="{ id, invalid, describedBy }")
            input(:id="id" v-model="form.pickupTime" type="time" :aria-invalid="invalid" :aria-describedby="describedBy")
          form-field.form-grid__wide(label="Коментар" :error="errors.comment" v-slot="{ id, invalid, describedBy }")
            textarea(:id="id" v-model="form.comment" maxlength="500" placeholder="Побажання до замовлення" :aria-invalid="invalid" :aria-describedby="describedBy")
        p.notice Оплата на сайті не передбачена — розрахуєтесь під час отримання замовлення в кондитерській.

    aside.summary(aria-labelledby="summary-title")
      h2.summary__title#summary-title Разом
      dl.summary__rows
        .summary__row
          dt Позиції ({{ cart.lineCount }})
          dd {{ formatPrice(cart.total) }}
        .summary__row
          dt Отримання
          dd Самовивіз
        .summary__row
          dt Оплата
          dd При отриманні
      .summary__total
        span.summary__total-label До сплати при отриманні
        span.summary__total-value {{ formatPrice(cart.total) }}
      p.summary__error(v-if="submitError" role="alert") {{ submitError }}
      app-button(type="submit" variant="accent" block :disabled="submitting")
        | {{ submitting ? 'Надсилаємо…' : 'Підтвердити замовлення' }}
      p.summary__note {{ site.settings?.orderNote }}
</template>

<style lang="scss" scoped>
.page {
  padding-block: $s-24 $s-64;
  @include up($bp-md) {
    padding-block: $s-40 $s-96;
  }

  &__head {
    display: flex;
    align-items: flex-end;
    gap: $s-16;
    padding-bottom: $s-24;
    @include up($bp-md) {
      gap: $s-20;
      padding-bottom: $s-32;
    }
  }

  &__title {
    @include display-page(72px);
  }

  &__count {
    padding-bottom: $s-8;
    color: $c-muted;
  }
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $s-24;
  padding-block: $s-32;

  &__text {
    color: $c-muted;
    font-size: 18px;
  }
}

.layout {
  display: grid;
  gap: $s-16;
  align-items: start;
  @include up($bp-lg) {
    grid-template-columns: 1fr 400px;
    gap: $s-40;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: $s-16;
    min-width: 0;
    @include up($bp-md) {
      gap: $s-32;
    }
  }
}

.panel {
  display: flex;
  flex-direction: column;
  gap: $s-20;
  padding: $s-24 $s-16;
  border-radius: $r-tile;
  background: $c-card;
  @include up($bp-md) {
    gap: $s-24;
    padding: $s-32;
  }

  &__title {
    @include title-lg;
  }
}

.items {
  display: flex;
  flex-direction: column;
}

.trap {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

.line-enter-active,
.line-leave-active {
  transition:
    opacity 0.3s,
    transform 0.3s;
}

.line-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.line-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

.item {
  display: grid;
  grid-template-columns: 64px 1fr auto;
  grid-template-areas:
    'photo info info'
    'state state qty';
  align-items: center;
  gap: $s-12 $s-12;
  padding-block: $s-16;

  & + & {
    border-top: 1px solid $c-line;
  }

  &:first-child {
    padding-top: 0;
  }

  // Very narrow phones: the toggle and the stepper do not fit in one row.
  @media (max-width: 359px) {
    grid-template-areas:
      'photo info info'
      'state state state'
      'qty qty qty';
  }

  @include up($bp-md) {
    grid-template-columns: 96px 1fr auto auto;
    grid-template-areas: 'photo info qty total';
    gap: $s-20;
  }

  &__photo {
    grid-area: photo;
    width: 64px;
    height: 64px;
    overflow: hidden;
    border-radius: 12px;
    background: $c-bg-alt;
    @include up($bp-md) {
      width: 96px;
      height: 96px;
      border-radius: $r-photo;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    grid-area: info;
    display: flex;
    flex-direction: column;
    gap: $s-4;
    min-width: 0;
    @include up($bp-md) {
      align-self: start;
    }
  }

  &__name {
    @include title-md;
    overflow-wrap: anywhere;
  }

  &__price-mobile {
    font-size: 16px;
    font-weight: 700;
    @include up($bp-md) {
      display: none;
    }
  }

  &__state {
    grid-area: state;
    justify-self: start;
    // on wide screens the toggle sits under the name, in the same cell as the info block
    @include up($bp-md) {
      grid-area: info;
      align-self: end;
    }
  }

  &__qty {
    grid-area: qty;
    justify-self: end;
    @media (max-width: 359px) {
      justify-self: start;
    }
  }

  &__total {
    display: none;
    grid-area: total;
    min-width: 72px;
    font-size: 18px;
    font-weight: 700;
    text-align: right;
    @include up($bp-md) {
      display: block;
    }
  }
}

.form-grid {
  display: grid;
  gap: $s-16;
  @include up($bp-md) {
    grid-template-columns: repeat(2, 1fr);
    gap: $s-20;
  }

  &__wide {
    @include up($bp-md) {
      grid-column: 1 / -1;
    }
  }
}

.notice {
  padding: $s-16 $s-20;
  border-radius: $r-input;
  background: $c-bg-alt;
  font-size: 15px;
  font-weight: 500;
  line-height: 24px;
}

.summary {
  display: flex;
  flex-direction: column;
  gap: $s-20;
  padding: $s-24 $s-20;
  border-radius: $r-tile;
  background: $c-ink;
  color: $c-bg;
  @include up($bp-md) {
    padding: $s-32;
  }
  @include up($bp-lg) {
    position: sticky;
    top: $s-24;
  }

  &__title {
    @include title-lg(34px);
  }

  &__rows {
    display: flex;
    flex-direction: column;
    gap: $s-16;
    margin: 0;
    padding-bottom: $s-20;
    border-bottom: 1px solid $c-line-on-dark;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    gap: $s-16;
    font-size: 15px;

    dt {
      color: $c-on-dark;
    }

    dd {
      margin: 0;
      font-weight: 600;
      text-align: right;
    }
  }

  &__total {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $s-16;
  }

  &__total-label {
    font-weight: 700;
  }

  &__total-value {
    color: $c-accent;
    font-family: $font-serif;
    font-weight: 600;
    font-size: 28px;
  }

  &__error {
    padding: $s-12 $s-16;
    border-radius: $r-input;
    background: rgb(166 61 47 / 25%);
    font-size: 14px;
  }

  &__note {
    color: $c-on-dark;
    font-size: 13px;
    line-height: 20px;
  }
}
</style>
