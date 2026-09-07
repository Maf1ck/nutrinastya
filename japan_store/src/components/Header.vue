<script lang="ts" setup>
import SearchBar from './SearchBar.vue';
import { ref } from 'vue';
</script>

<template lang="pug">
header.header
    .header__logo
        img(src="../assets/images/Logo.jpg" alt="Logo")
        span.header__title YkL
    nav.header__nav
        ul
            li: a(href="#") Home
            li: a(href="#") Fits
            li: a(href="#") Catalog
            li: a(href="#") New Collection
    .header__search
        SearchBar
    .header__buttons
        button.header__login Login
        button.header__signup Sign Up
    
</template>

<style lang="scss" scoped>
.header{
    // background: linear-gradient(90deg, #59E2FD 0%, #FFB6E1 100%);
    background: #59E2FD; 
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 30px;
    gap: 20px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-radius: 50px;
    margin-top: 5px;
    
    &__logo{
        display: flex;
        align-items: center;
        white-space: nowrap;
        flex-shrink: 0;
        gap: 10px;
        
        img{
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
        }
        .header__title{
            font-size: 20px;
            font-weight: 700;
            color: #fff;
            letter-spacing: -0.5px;
        }
    }
    &__nav{
        flex: 1;
        
        ul{
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
            gap: 8px;
            
            li{
                a{
                    text-decoration: none;
                    color: #4a5568;
                    font-size: 13px;
                    font-weight: 600;
                    padding: 7px 18px;
                    border-radius: 25px;
                    display: inline-block;
                    background-color: rgba(255, 255, 255, 0.85);
                    
                    &:hover{
                        background-color: #fff;
                        color: #2d3748;
                    }
                }
            }
        }
    }
    &__search{
        flex: 0.8;
        min-width: 200px;
    }
    &__buttons{
        display: flex;
        gap: 10px;
        flex-shrink: 0;
    }
    &__login,
    &__signup{
        padding: 8px 22px;
        border: none;
        border-radius: 25px;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
    }
    &__login{
        background-color: rgba(255, 255, 255, 0.3);
        color: #fff;
        border: 2px solid rgba(255, 255, 255, 0.6);
        
        &:hover{
            background-color: rgba(255, 255, 255, 0.4);
            border-color: #fff;
        }
    }
    &__signup{
        background-color: #FFD700;
        color: #1a202c;
        
        &:hover{
            background-color: #FFC700;
        }
    }
}

@media (max-width: 1024px){
    .header{
        padding: 15px 30px;
        gap: 20px;
        
        &__nav ul{
            gap: 8px;
            
            li a{
                padding: 8px 16px;
                font-size: 14px;
            }
        }
        
        &__search{
            min-width: 180px;
        }
    }
}

@media (max-width: 768px){
    .header{
        flex-wrap: wrap;
        padding: 12px 20px;
        gap: 12px;
        
        &__logo .header__title{
            font-size: 22px;
        }
        
        &__nav{
            order: 3;
            flex-basis: 100%;
            
            ul{
                flex-wrap: wrap;
                gap: 6px;
                
                li a{
                    font-size: 13px;
                    padding: 7px 14px;
                }
            }
        }
        
        &__search{
            flex: 1;
            min-width: 150px;
        }
        
        &__login,
        &__signup{
            padding: 10px 20px;
            font-size: 13px;
        }
    }
}

</style>