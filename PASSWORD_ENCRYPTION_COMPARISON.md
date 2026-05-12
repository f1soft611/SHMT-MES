# 비밀번호 암호화 로직 일관성 비교 분석

## 요약

세 가지 비밀번호 처리 로직에서 **일관된 암호화 방식**을 사용하고 있습니다. 모두 `mberId` (또는 `Id`)를 Salt 값으로 사용합니다.

---

## 상세 비교 표

| 항목                 | 1. 사용자 관리 수정               | 2. 개인 비밀번호 변경                   | 3. 로그인 검증                    |
| -------------------- | --------------------------------- | --------------------------------------- | --------------------------------- |
| **파일**             | `EgovMberManageServiceImpl.java`  | `EgovMberManageApiController.java`      | `EgovLoginServiceImpl.java`       |
| **메서드**           | `updateMber()`                    | `updateUserPassword()`                  | `actionLogin()`                   |
| **메서드 위치**      | Line 101                          | Line 610                                | Line 41                           |
| **암호화 메서드**    | `EgovFileScrty.encryptPassword()` | `EgovFileScrty.encryptPassword()`       | `EgovFileScrty.encryptPassword()` |
| **Salt 값**          | `mberManageVO.getMberId()`        | `mberId` (currentUser에서 추출)         | `vo.getId()`                      |
| **Salt의 출처**      | Parameter 객체의 `mberId` 필드    | DB 조회 결과 `currentUser.getMberId()`  | 로그인 요청의 `LoginVO.id` 필드   |
| **암호화 적용 대상** | 새 비밀번호 또는 변경 비밀번호    | 기존 비밀번호 검증 + 새 비밀번호 암호화 | 로그인 시 입력 비밀번호           |

---

## 코드 스니펫

### 1. 사용자 관리 - updateMber() 메서드

**파일:** `EgovMberManageServiceImpl.java` (Line 101-115)

```java
@Override
public void updateMber(MberManageVO mberManageVO) throws Exception {
    //패스워드 암호화
    if(mberManageVO.getPassword().isEmpty() || mberManageVO.getPassword().equals("")) {
        //업데이트 시 암호가 공백이면 암호화 과정 건너띈다.
    } else {
        String pass = EgovFileScrty.encryptPassword(
            mberManageVO.getPassword(),              // ← 비밀번호
            mberManageVO.getMberId()                 // ← Salt (사용자ID)
        );
        mberManageVO.setPassword(pass);
    }
    mberManageDAO.updateMber(mberManageVO);
}
```

**특징:**

- Salt: `mberManageVO.getMberId()`
- 빈 비밀번호일 경우 암호화 스킵
- INSERT와 UPDATE 모두에서 동일한 암호화 방식 사용

---

### 2. 개인 비밀번호 변경 - updateUserPassword() 메서드

**파일:** `EgovMberManageApiController.java` (Line 610-678)

#### 기존 비밀번호 검증 (Line 641-642):

```java
// 비밀번호 암호화 시 mberId를 Salt로 사용
String mberId = currentUser.getMberId();
log.info("===>>> 암호화에 사용할 mberId: {}", mberId);

// 현재 비밀번호 검증
String encryptedOldPassword = egovframework.let.utl.sim.service.EgovFileScrty.encryptPassword(
    oldPassword,                         // ← 기존 비밀번호
    mberId                               // ← Salt (DB에서 조회한 사용자ID)
);
```

#### 새 비밀번호 암호화 (Line 665-666):

```java
// 새 비밀번호 암호화 및 업데이트
String encryptedNewPassword = egovframework.let.utl.sim.service.EgovFileScrty.encryptPassword(
    newPassword,                         // ← 새 비밀번호
    mberId                               // ← Salt (동일한 사용자ID)
);
```

**특징:**

- Salt: `currentUser.getMberId()` (DB에서 조회)
- 기존 비밀번호와 새 비밀번호 모두 동일한 Salt 사용
- 인증된 사용자(`@AuthenticationPrincipal LoginVO user`)의 정보 사용

---

### 3. 로그인 검증 - actionLogin() 메서드

**파일:** `EgovLoginServiceImpl.java` (Line 41-59)

```java
@Override
public LoginVO actionLogin(LoginVO vo) throws Exception {

    // 1. 입력한 비밀번호를 암호화한다.
    String enpassword = EgovFileScrty.encryptPassword(
        vo.getPassword(),                // ← 로그인 입력 비밀번호
        vo.getId()                       // ← Salt (로그인 요청의 사용자ID)
    );
    vo.setPassword(enpassword);

    // 2. 아이디와 암호화된 비밀번호가 DB와 일치하는지 확인한다.
    LoginVO loginVO = loginDAO.actionLogin(vo);

    // 3. 결과를 리턴한다.
    if (loginVO != null && !loginVO.getId().equals("") && !loginVO.getPassword().equals("")) {
        return loginVO;
    } else {
        loginVO = new LoginVO();
    }

    return loginVO;
}
```

**특징:**

- Salt: `vo.getId()` (로그인 요청의 사용자ID)
- DB 조회 후 암호화된 비밀번호와 DB 저장값 비교
- 신원 미확인 사용자 요청 처리

---

## 일관성 검토 결과

### ✅ 일관된 부분

1. **암호화 메서드 동일**
   - 세 곳 모두 `EgovFileScrty.encryptPassword()` 사용

2. **Salt 값 일관성**
   - 세 곳 모두 사용자 ID를 Salt로 사용:
     - `updateMber()`: `mberManageVO.getMberId()`
     - `updateUserPassword()`: `currentUser.getMberId()`
     - `actionLogin()`: `vo.getId()`

3. **암호화 위치**
   - 비밀번호가 저장/검증되기 전에 항상 암호화됨

### ⚠️ 주의사항

1. **updateMber()의 빈 비밀번호 처리**
   - 빈 비밀번호는 암호화되지 않고 그대로 저장됨
   - 이는 의도적인 설계로 보임 (암호 변경하지 않고 다른 정보만 수정 시)

2. **Salt 값 추출 방식의 차이**
   - `updateMber()`: 매개변수에서 직접 추출
   - `updateUserPassword()`: DB 조회 결과에서 추출
   - `actionLogin()`: 로그인 요청에서 추출
   - **결과는 동일하지만 출처가 다름**

3. **사용자 ID 필드명**
   - `MberManageVO`: `mberId` (회원 관리용)
   - `LoginVO`: `id` (로그인 객체용)
   - 실제로는 같은 사용자 ID를 가리킴

---

## 권장사항

모든 비밀번호 암호화가 일관되게 처리되고 있으므로 **추가 수정은 필요하지 않습니다**.

다만 향후 유지보수를 위해 다음을 고려하세요:

1. **상수화**

   ```java
   // EgovFileScrty 클래스에 메서드 추가 고려
   public static String encryptPasswordWithUserId(String password, String userId) {
       return encryptPassword(password, userId);
   }
   ```

2. **단위 테스트**
   - 세 메서드 모두 동일한 입력(사용자ID, 비밀번호)에 대해 동일한 암호화 결과가 나오는지 검증

3. **문서화**
   - Salt로 사용되는 필드가 `id` 또는 `mberId`임을 명시적으로 주석으로 표시
