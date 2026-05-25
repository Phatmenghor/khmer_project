package com.emenu;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.TimeZone;

@SpringBootApplication
@EnableScheduling
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
@EnableTransactionManagement
public class EMenuApplication {

	public static void main(String[] args) {
		// Must be set before Spring context initialises so every LocalDateTime.now()
		// and LocalDate.now() throughout the application uses Cambodia time (UTC+7).
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Phnom_Penh"));
		SpringApplication.run(EMenuApplication.class, args);
		System.out.println("""
            
            🇰🇭 Cambodia E-Menu Platform Started Successfully! 🇰🇭
           
            
            🌐 Access Points:
            • Application: http://localhost:8080
            • Swagger UI: http://localhost:8080/swagger-ui.html
            • Health Check: http://localhost:8080/actuator/health
            
            """);
	}
}