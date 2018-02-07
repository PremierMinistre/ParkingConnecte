################################################################################
# Automatically-generated file. Do not edit!
################################################################################

# Add inputs and outputs from these tool invocations to the build variables 
C_SRCS += \
D:/Enseignement/I3/2017_2018/Nordic/nRF51_SDK/components/drivers_nrf/delay/nrf_delay.c 

OBJS += \
./nRF_Drivers/nrf_delay.o 

C_DEPS += \
./nRF_Drivers/nrf_delay.d 


# Each subdirectory must supply rules for building sources it contributes
nRF_Drivers/nrf_delay.o: D:/Enseignement/I3/2017_2018/Nordic/nRF51_SDK/components/drivers_nrf/delay/nrf_delay.c
	@echo 'Building file: $<'
	@echo 'Invoking: Cross ARM C Compiler'
	arm-none-eabi-gcc -mcpu=cortex-m0 -mthumb -O2  -g -DNRF51=1 -I"D:\Enseignement\I3\2017_2018\Nordic\nRF51_SDK\components\drivers_nrf\common" -I"D:\Enseignement\I3\2017_2018\Nordic\nRF51_SDK\components\drivers_nrf\hal" -I"D:\Enseignement\I3\2017_2018\Nordic\nRF51_SDK\examples\bsp" -I"C:\Program Files (x86)\GNU Tools ARM Embedded\5.4 2016q3\lib\gcc\arm-none-eabi\5.4.1\include" -I"D:\Enseignement\I3\2017_2018\Nordic\nRF51_SDK\components\toolchain\gcc" -std=gnu11 -MMD -MP -MF"$(@:%.o=%.d)" -MT"$(@)" -c -o "$@" "$<"
	@echo 'Finished building: $<'
	@echo ' '


