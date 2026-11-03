<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import HeroSection from '@/components/HeroSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import ServicesSection from '@/components/ServicesSection.vue'
import QuizSection from '@/components/QuizSection.vue'
import StepsSection from '@/components/StepsSection.vue'
import ResultsSection from '@/components/ResultsSection.vue'
import FaqSection from '@/components/FaqSection.vue'
import BlogSection from '@/components/BlogSection.vue'
import ContactSection from '@/components/ContactSection.vue'
import AppFooter from '@/components/AppFooter.vue'
import ScrollTopButton from '@/components/ScrollTopButton.vue'
</script>

<template lang="pug">
AppHeader
main
  HeroSection
  AboutSection
  ServicesSection
  QuizSection
  StepsSection
  ResultsSection
  BlogSection
  ContactSection
  FaqSection
AppFooter
ScrollTopButton
</template>
