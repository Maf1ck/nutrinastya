<script lang="ts" setup>
import { ref } from 'vue';
const search = ref('');
</script>

<template lang="pug">
    .header__search
        img.header__search-icon(src="../assets/icons/search.svg" width="24" height="24" alt="Search")
        input.header__search-input(type="text" v-model="search" placeholder="Search")
</template>

<style lang="scss" scoped>
.header__search {
    display: flex;
    align-items: center;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 25px;
    padding: 8px 15px;
    gap: 8px;
    width: 100%;

    &-icon {
        color: #4a5568;
        flex-shrink: 0;
        font-size: 16px;
    }

    &-input {
        flex: 1;
        border: none;
        background: transparent;
        color: #2d3748;
        font-size: 13px;
        padding: 0;
        font-weight: 500;

        &::placeholder {
            color: #a0aec0;
        }

        &:focus {
            outline: none;
        }
    }
}
</style>