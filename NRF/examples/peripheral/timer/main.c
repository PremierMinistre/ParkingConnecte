/* Copyright (c) 2014 Nordic Semiconductor. All Rights Reserved.
 *
 * The information contained herein is property of Nordic Semiconductor ASA.
 * Terms and conditions of usage are described in detail in NORDIC
 * SEMICONDUCTOR STANDARD SOFTWARE LICENSE AGREEMENT.
 *
 * Licensees are granted free, non-transferable use of the information. NO
 * WARRANTY of ANY KIND is provided. This heading must NOT be removed from
 * the file.
 *
 */

/** @file
 * @defgroup nrf_dev_timer_example_main main.c
 * @{
 * @ingroup nrf_dev_timer_example
 * @brief Timer Example Application main file.
 *
 * This file contains the source code for a sample application using Timer0.
 *
 */

#include <stdbool.h>
#include <stdint.h>
#include "nrf.h"
#include "bsp.h"

#include "nrf_drv_timer.h"
#include "bsp.h"
#include "app_error.h"

const nrf_drv_timer_t TIMER_LED = NRF_DRV_TIMER_INSTANCE(0);

const uint8_t leds_list[LEDS_NUMBER] = LEDS_LIST;
//static uint32_t compteur_led = 18;

// Gestion du capteur ultra son
static uint32_t tempsCapteur = 0;
static uint32_t debutReception = 0;// Prend la valeur de tempsCapteur au début de la réception du signal de retour
static uint32_t dureeReception = 0;// Durée du signal de retour => permet de calculer la distance
static uint32_t fin_reception_b = 0;// fin

/**
 * @brief Handler for timer events.
 */
void timer_led_event_handler(nrf_timer_event_t event_type, void* p_context)
{
    //static uint32_t i;
    //uint32_t led_to_invert = (1 << leds_list[(i++) % LEDS_NUMBER]);
    
    switch(event_type)
    {
        case NRF_TIMER_EVENT_COMPARE0:
            //LEDS_INVERT(led_to_invert);
        	//LEDS_INVERT(1<<compteur_led);
        	//compteur_led++;
        	//if (compteur_led ==22){compteur_led=18;}
        	// Gestion capteur
        	//dureeReception = tempsCapteur - debutReception;
        	if(tempsCapteur==0){// Burst en out
        		nrf_gpio_pin_write(3,1);//Début burst
        		debutReception = 0;
        		dureeReception= 0;
        		fin_reception_b = 0;
        		LEDS_ON(BSP_LED_4_MASK);
        	}else if(tempsCapteur==20){//Fin burst
        		nrf_gpio_pin_write(3,0);
        	}else if(tempsCapteur>20 && tempsCapteur<400){// Lecture
        		if (nrf_gpio_pin_read(4) == 1 && debutReception==0){// Début de réception du signal de retour
        			debutReception = tempsCapteur;
        			//LEDS_OFF(BSP_LED_4_MASK);
        			//LEDS_ON(LEDS_MASK);
        		}else if ((nrf_gpio_pin_read(4) == 0) && (debutReception!=0)  && !fin_reception_b){// Fin du signal de retour
        			dureeReception = tempsCapteur - debutReception;
        			//LEDS_ON(BSP_LED_4_MASK);
        			fin_reception_b = 1;
        		}
        	}/*else{
        		LEDS_OFF(LEDS_MASK);
        	}*/
        	if(tempsCapteur>20 && tempsCapteur<2000 && dureeReception>4 && dureeReception<12 && fin_reception_b){
        		LEDS_OFF(BSP_LED_4_MASK);
        	}
        	tempsCapteur++;
        	if(tempsCapteur==2000){tempsCapteur = 0;}// 1 test toutes les 2 secondes
        	break;
        default:
            //Do nothing.
            break;
    }    
}


/**
 * @brief Function for main application entry.
 */
int main(void)
{
   // uint32_t time_ms = 1; //Time(in miliseconds) between consecutive compare events.
    uint32_t time_ticks;
    uint32_t err_code = NRF_SUCCESS;
    
    nrf_gpio_cfg_output(3);//Sortie Capteur Ultra-sons
    nrf_gpio_cfg_input(4,NRF_GPIO_PIN_PULLDOWN);//Entrée Capteur Ultra-sons


    //Configure all leds on board.
    LEDS_CONFIGURE(LEDS_MASK);
    LEDS_ON(LEDS_MASK);
    //LEDS_ON(LEDS_MASK);
    //Configure TIMER_LED for generating simple light effect - leds on board will invert his state one after the other.
    err_code = nrf_drv_timer_init(&TIMER_LED, NULL, timer_led_event_handler);
    APP_ERROR_CHECK(err_code);
    
    //time_ticks = nrf_drv_timer_ms_to_ticks(&TIMER_LED, time_ms);// 16 000 ticks pour 1 ms
    time_ticks = 4000;
    nrf_drv_timer_extended_compare(
         &TIMER_LED, NRF_TIMER_CC_CHANNEL0, time_ticks, NRF_TIMER_SHORT_COMPARE0_CLEAR_MASK, true);
    
    nrf_drv_timer_enable(&TIMER_LED);

    while(1)
    {
        __WFI();
    }
}

/** @} */
