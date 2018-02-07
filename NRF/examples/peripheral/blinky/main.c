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
 *
 * @defgroup blinky_example_main main.c
 * @{
 * @ingroup blinky_example
 * @brief Blinky Example Application main file.
 *
 */

#include <stdbool.h>
#include <stdint.h>
#include "nrf_delay.h"
#include "nrf_gpio.h"
#include "boards.h"


const uint8_t leds_list[LEDS_NUMBER] = LEDS_LIST;

/**
 * @brief Function for application main entry.
 */
int main(void)
{
    // Configure LED-pins as outputs.
   //LEDS_CONFIGURE(LEDS_MASK);
	// nRF51822  --> 32 I/O configurables
	nrf_gpio_cfg_output(18);

	nrf_gpio_pin_set(18);

	   nrf_gpio_pin_dir_set(16, NRF_GPIO_PIN_DIR_INPUT);
	    nrf_gpio_pin_dir_set(17, NRF_GPIO_PIN_DIR_INPUT);
	    nrf_gpio_pin_dir_set(18, NRF_GPIO_PIN_DIR_OUTPUT);
	    nrf_gpio_pin_dir_set(19, NRF_GPIO_PIN_DIR_OUTPUT);
	    nrf_gpio_pin_dir_set(20, NRF_GPIO_PIN_DIR_OUTPUT);
	    nrf_gpio_pin_dir_set(21, NRF_GPIO_PIN_DIR_OUTPUT);
	    nrf_gpio_pin_dir_set(22, NRF_GPIO_PIN_DIR_OUTPUT);


	    nrf_gpio_cfg_input(16, NRF_GPIO_PIN_PULLUP);
	    nrf_gpio_cfg_input(17, NRF_GPIO_PIN_PULLUP);

	do{
		if(!nrf_gpio_pin_read(16)){
			nrf_gpio_pin_set(19);
		}else{
			nrf_gpio_pin_clear(19);
		}
		nrf_gpio_pin_set(18);
		nrf_delay_ms(50);
		nrf_gpio_pin_clear(18);
		nrf_delay_ms(3000);

	}while(1);

    // Toggle LEDs.
    while (true)
    {
        for (int i = 0; i < LEDS_NUMBER; i++)
        {
            LEDS_INVERT(1 << leds_list[i]);
            nrf_delay_ms(500);
        }
    }
}


/** @} */
