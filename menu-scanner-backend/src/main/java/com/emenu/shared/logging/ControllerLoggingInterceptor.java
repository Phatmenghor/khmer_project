package com.emenu.shared.logging;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Global Interceptor that captures the target Controller Class and Method Name
 * for every Spring MVC controller endpoint in the platform and logs request entry
 * with full location tags [ControllerClass#methodName].
 */
@Component
@Slf4j
public class ControllerLoggingInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (handler instanceof HandlerMethod handlerMethod) {
            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();
            String handlerInfo = controllerName + "#" + methodName;

            MDC.put("handler", handlerInfo);
            request.setAttribute("handlerInfo", handlerInfo);

            log.info("Endpoint Request: {} {} [{}]", request.getMethod(), request.getRequestURI(), handlerInfo);
        }
        return true;
    }
}
