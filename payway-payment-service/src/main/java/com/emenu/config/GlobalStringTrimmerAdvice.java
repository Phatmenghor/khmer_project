package com.emenu.config;

import org.springframework.beans.propertyeditors.StringTrimmerEditor;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.InitBinder;

@ControllerAdvice
public class GlobalStringTrimmerAdvice {

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        // Automatically trim whitespace from all incoming String controller parameters
        binder.registerCustomEditor(String.class, new StringTrimmerEditor(false));
    }
}
