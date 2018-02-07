
/**************************************************************************
* Includes
**************************************************************************/
#include <stdbool.h>
#include <stdint.h>
#include <stdio.h>

#include "app_timer.h"
#include "boards.h"
#include "bsp.h"
#include "nrf.h"
#include "nrf_adc.h"
#include "nrf_delay.h"
#include "nrf_gpio.h"
#include "nrf_gpiote.h"
#include "micro_esb.h"
#include "nrf_drv_gpiote.h"
#include "uesb_error_codes.h"


/**************************************************************************
* Module Functions Definitions
**************************************************************************/
void bsp_evt_handler(bsp_event_t ev);
//void ADC_IRQHandler(void);
void uesb_event_handler();

void nrf_gpio_config(void);
void nrf_bsp_config(void);
void clock_initialization(void);
void adc_config(void);
void nrf_radio_config(void);
void transmit_data(uint8_t data);

/**************************************************************************
* Module Typedef Definitions
**************************************************************************/
#define NRF_APP_PRIORITY 2
#define APP_TIMER_PRESCALER      0
#define APP_TIMER_MAX_TIMERS     (1 + BSP_APP_TIMERS_NUMBER) /**< Maximum number of simultaneously created timers. */
#define APP_TIMER_OP_QUEUE_SIZE  2
#define IDLE 		9
#define AVANCE 		1
#define RECULE 		2
#define GAUCHE 		3
#define DROITE		4
#define BTN_HAUT	5
#define BTN_BAS		6
#define BTN_GAUCHE	7
#define BTN_DROITE	8

volatile uint32_t adc_vertical;
volatile uint32_t adc_horizontal;

//Transmitting/Receiving VAR
static uesb_payload_t tx_payload, rx_payload;
static uint32_t rf_interrupts;
uesb_config_t uesb_config = UESB_DEFAULT_CONFIG;

void bsp_evt_handler(bsp_event_t evt)
{
    switch(evt)
    {
        case BSP_EVENT_KEY_0:
        	transmit_data(BTN_HAUT);
        	break;
        case BSP_EVENT_KEY_1:
        	transmit_data(BTN_DROITE);
        	break;
        case BSP_EVENT_KEY_2:
        	transmit_data(BTN_BAS);
        	break;
        case BSP_EVENT_KEY_3:
        	transmit_data(BTN_GAUCHE);
        	break;
        default:
        	transmit_data(IDLE);
        	break;
    }
}

void uesb_event_handler(){
	static uint32_t tx_attempts;

	uesb_get_clear_interrupts(&rf_interrupts);

	if(rf_interrupts & UESB_INT_TX_SUCCESS_MSK)
	{
		nrf_adc_conversion_event_clean();
		nrf_adc_start();
	}

	if(rf_interrupts & UESB_INT_TX_FAILED_MSK)
	{
		uesb_flush_tx();
	}

	if(rf_interrupts & UESB_INT_RX_DR_MSK)
	{
		uesb_read_rx_payload(&rx_payload);
		NRF_GPIO->OUTCLR = 0xFUL << 8;
		NRF_GPIO->OUTSET = (uint32_t)((rx_payload.data[2] & 0x0F) << 8);
	}

	uesb_get_tx_attempts(&tx_attempts);
	NRF_GPIO->OUTCLR = 0xFUL << 12;
	NRF_GPIO->OUTSET = (tx_attempts & 0x0F) << 12;
}

void nrf_gpio_config(void)
{
	nrf_gpio_cfg_output(21);
	nrf_gpio_cfg_output(22);
	nrf_gpio_cfg_output(23);
	nrf_gpio_cfg_output(24);
	nrf_gpio_cfg_output(25);
	nrf_gpio_cfg_output(28);
	nrf_gpio_cfg_output(29);

	nrf_gpio_pin_write(21,1);
	nrf_gpio_pin_write(22,1);
	nrf_gpio_pin_write(23,1);
	nrf_gpio_pin_write(24,1);
	nrf_gpio_pin_write(25,1);
	nrf_gpio_pin_write(28,0);
	nrf_gpio_pin_write(29,1);
}

void nrf_bsp_config(void)
{

	bsp_init(BSP_INIT_BUTTONS,
			APP_TIMER_TICKS(100, APP_TIMER_PRESCALER),
			bsp_evt_handler);

    bsp_buttons_enable();
}

void adc_config(void)
{
    const nrf_adc_config_t nrf_adc_config = NRF_ADC_CONFIG_DEFAULT;
    // Initialize and configure ADC
    nrf_adc_configure( (nrf_adc_config_t *)&nrf_adc_config);
    //nrf_adc_input_select(NRF_ADC_CONFIG_INPUT_2);
    nrf_adc_int_enable(ADC_INTENSET_END_Enabled << ADC_INTENSET_END_Pos);
    //NVIC_SetPriority(ADC_IRQn, NRF_APP_PRIORITY);
    //NVIC_EnableIRQ(ADC_IRQn);
}

void clock_initialization(void)
{
    NRF_CLOCK->LFCLKSRC            = (CLOCK_LFCLKSRC_SRC_Xtal << CLOCK_LFCLKSRC_SRC_Pos);
    NRF_CLOCK->EVENTS_LFCLKSTARTED = 0;
    NRF_CLOCK->TASKS_LFCLKSTART    = 1;

    while (NRF_CLOCK->EVENTS_LFCLKSTARTED == 0)
    {
        // Do nothing.
    }
}

void nrf_radio_config(){

	//uint8_t rx_addr_p0[] = {0xE1, 0xF0, 0xF0, 0xF0, 0xF0};
	//uint8_t rx_addr_p1[] = {0xD2, 0xF0, 0xF0, 0xF0, 0xF0};
	//uint8_t rx_addr_p2   = 0x66;

	NRF_CLOCK->EVENTS_HFCLKSTARTED = 0;
	NRF_CLOCK->TASKS_HFCLKSTART = 1;
	while(NRF_CLOCK->EVENTS_HFCLKSTARTED == 0);
	uesb_config_t uesb_config       = UESB_DEFAULT_CONFIG;
	uesb_config.tx_output_power 	= UESB_TX_POWER_0DBM;
	uesb_config.rf_channel          = 3;
	uesb_config.crc                 = UESB_CRC_16BIT;
	uesb_config.dynamic_ack_enabled = 0;
	uesb_config.protocol            = UESB_PROTOCOL_ESB_DPL;
	uesb_config.bitrate             = UESB_BITRATE_2MBPS;
	uesb_config.retransmit_count    = 6;
	uesb_config.retransmit_delay    = 500;
	uesb_config.mode                = UESB_MODE_PTX;
	uesb_config.event_handler       = uesb_event_handler;
	uesb_init(&uesb_config);
}

void transmit_data(uint8_t data)
{
	switch(data){
	case AVANCE :
		nrf_gpio_pin_write(24,0);
		nrf_gpio_pin_write(22,1);
		nrf_gpio_pin_write(21,1);
		nrf_gpio_pin_write(23,1);
		nrf_gpio_pin_write(25,1);
		nrf_gpio_pin_write(29,1);
		nrf_delay_ms(30);
		break;
	case RECULE :
		nrf_gpio_pin_write(22,0);
		nrf_gpio_pin_write(24,1);
		nrf_gpio_pin_write(21,1);
		nrf_gpio_pin_write(23,1);
		nrf_gpio_pin_write(25,1);
		nrf_gpio_pin_write(29,1);
		nrf_delay_ms(30);
		break;
	case GAUCHE :
		nrf_gpio_pin_write(21,0);
		nrf_gpio_pin_write(24,1);
		nrf_gpio_pin_write(22,1);
		nrf_gpio_pin_write(23,1);
		nrf_gpio_pin_write(25,1);
		nrf_gpio_pin_write(29,1);
		nrf_delay_ms(30);
		break;
	case DROITE :
		nrf_gpio_pin_write(23,0);
		nrf_gpio_pin_write(24,1);
		nrf_gpio_pin_write(22,1);
		nrf_gpio_pin_write(21,1);
		nrf_gpio_pin_write(25,1);
		nrf_gpio_pin_write(29,1);
		nrf_delay_ms(30);
		break;
	case BTN_GAUCHE :
		nrf_gpio_pin_write(25,0);
		nrf_gpio_pin_write(24,1);
		nrf_gpio_pin_write(22,1);
		nrf_gpio_pin_write(21,1);
		nrf_gpio_pin_write(23,1);
		nrf_gpio_pin_write(29,1);
		nrf_delay_ms(30);
		break;
	case BTN_DROITE :
		nrf_gpio_pin_write(29,0);
		nrf_gpio_pin_write(24,1);
		nrf_gpio_pin_write(22,1);
		nrf_gpio_pin_write(21,1);
		nrf_gpio_pin_write(23,1);
		nrf_gpio_pin_write(25,1);
		nrf_delay_ms(30);
		break;
	case IDLE :
		nrf_gpio_pin_write(24,1);
		nrf_gpio_pin_write(22,1);
		nrf_gpio_pin_write(21,1);
		nrf_gpio_pin_write(23,1);
		nrf_gpio_pin_write(25,1);
		nrf_gpio_pin_write(29,1);
		break;

	}
	nrf_gpio_pin_toggle(28);
	//implémenter liaison filaire
	tx_payload.length  = 8;
	tx_payload.pipe    = 0;
	tx_payload.data[0] = data;
	uesb_start_tx();
	uesb_write_tx_payload(&tx_payload);
	nrf_delay_ms(10);
}

int main(void)
{
	nrf_gpio_config();
    adc_config();
	clock_initialization();
    APP_TIMER_INIT(APP_TIMER_PRESCALER, APP_TIMER_MAX_TIMERS, APP_TIMER_OP_QUEUE_SIZE, NULL);
	nrf_bsp_config();
	nrf_radio_config();
    while (true)
    {
    		adc_vertical = nrf_adc_convert_single(NRF_ADC_CONFIG_INPUT_4);
    		if(adc_vertical > 540){
    			transmit_data(AVANCE);
    		}else if(adc_vertical < 340){
    	    	transmit_data(RECULE);
    		}else{
    	    		adc_horizontal = nrf_adc_convert_single(NRF_ADC_CONFIG_INPUT_2);
    	    	if(adc_horizontal > 540)
    	    		transmit_data(DROITE);
    	    	else if(adc_horizontal < 340)
    	    		transmit_data(GAUCHE);
    	    	else
    	    		transmit_data(IDLE);
    	    }
    }
}
