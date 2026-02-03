package egovframework.com.cmm;

import egovframework.com.cmm.exception.BizException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BizException.class)
    public Map<String, Object> handleBizException(BizException e) {
        Map<String, Object> res = new HashMap<>();
        res.put("resultCode", "FAIL");
        res.put("resultMessage", e.getMessage());
        res.put("message", e.getMessage());
        return res;
    }
}
