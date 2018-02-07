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
#ifndef CUSTOM_H
#define CUSTOM_H



// Defines the number of LEDs. In this example, there is a single RGB LED.
#define LEDS_NUMBER    5

// Defines which PIOs control the color of the LED.
#define LED_START      	18
#define LED_1    		18
#define LED_2		   	19
#define LED_3			20
#define LED_4			21
#define LED_5			22
#define LED_STOP       	22

#define LEDS_ACTIVE_STATE 1


#define LEDS_LIST        { LED_1, LED_2, LED_3, LED_4, LED_5 }

// Defines an RGB LED as 3 single LEDs.
#define BSP_LED_0 LED_RGB_RED
#define BSP_LED_1 LED_RGB_GREEN
#define BSP_LED_2 LED_RGB_BLUE

#define LED_RGB_RED_MASK    (1<<LED_RGB_RED)
#define LED_RGB_GREEN_MASK  (1<<LED_RGB_GREEN)
#define LED_RGB_BLUE_MASK   (1<<LED_RGB_BLUE)

#define BSP_LED_0_MASK    (1<<BSP_LED_0)
#define BSP_LED_1_MASK    (1<<BSP_LED_1)
#define BSP_LED_2_MASK    (1<<BSP_LED_2)

#define LEDS_MASK      (BSP_LED_0_MASK | BSP_LED_1_MASK | BSP_LED_2_MASK)

// Defines which LEDs are lit when the signal is low. In this example,
// all LEDs are lit.
#define LEDS_INV_MASK  LEDS_MASK

// Defines which Buttons
#define BUTTONS_NUMBER 2

#define BUTTON_START   16
#define BUTTON_1       16
#define BUTTON_2       17
#define BUTTON_PULL    NRF_GPIO_PIN_PULLUP

#define BUTTONS_LIST { BUTTON_1, BUTTON_2 }

#define BSP_BUTTON_0   BUTTON_1
#define BSP_BUTTON_1   BUTTON_2

#define BSP_BUTTON_0_MASK (1<<BSP_BUTTON_0)
#define BSP_BUTTON_1_MASK (1<<BSP_BUTTON_1)

#define BUTTONS_MASK   0x00030000

// Defines the UART connection with J-Link.
#define RX_PIN_NUMBER  11
#define TX_PIN_NUMBER  9
#define CTS_PIN_NUMBER 10
#define RTS_PIN_NUMBER 8
#define HWFC           true

#endif // CUSTOM_H
