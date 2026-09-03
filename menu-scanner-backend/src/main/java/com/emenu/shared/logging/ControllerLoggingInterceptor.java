package com.emenu.shared.logging;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Interceptor that identifies the target Controller Class and Method Name
 * for every incoming HTTP request and populates MDC for request correlation.
 */
@Component
public class ControllerLoggingInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (handler instanceof HandlerMethod handlerMethod) {
            String controllerName = handlerMethod.getBeanType().getSimpleName();
            String methodName = handlerMethod.getMethod().getName();
            String handlerInfo = controllerName + "#" + methodName;

            MDC.put("handler", handlerInfo);
            request.setAttribute("handlerInfo", handlerInfo);
        }
        return true;
    }
}
