# Checklist de formulario de cobro - Openpay

Este documento registra el cumplimiento del formulario de cobro solicitado para la revisión técnica de Openpay.

## Requisitos implementados

1. **Estado de la transacción**
   - Éxito: muestra `Transacción exitosa` y el mensaje `Recibimos tu pago. ¡Gracias por tu compra!`.
   - Fallo: muestra mensajes visibles y diferenciados según el resultado devuelto por Openpay.

2. **Número de tarjeta**
   - El campo limita la entrada a un máximo de 16 dígitos.
   - Se permite el ingreso de tarjetas de 15 dígitos, necesario para American Express.
   - La tokenización y validación definitiva se mantiene en Openpay.

3. **CVV**
   - Solo permite números.
   - Máximo 4 dígitos.
   - Validación de 3 o 4 dígitos antes de tokenizar.

4. **Expiración**
   - Formato obligatorio `MM/AA`.
   - Valida rango de mes.
   - Bloquea fechas anteriores al mes actual antes de enviar a Openpay.

5. **Mensajes de rechazo**
   - `Fondos insuficientes` para error Openpay 3003.
   - `Tarjeta rechazada` para declinación, tarjeta robada/fraudulenta/perdida o restricciones bancarias relevantes.
   - `Transacción fallida` para tarjeta vencida, CVV inválido, errores de comunicación y fallos generales.
   - Mantiene tratamiento específico para credenciales Openpay incorrectas y tarjetas de prueba usadas fuera de Sandbox.

6. **Prevención de cobro duplicado**
   - El botón de pago queda bloqueado mientras una transacción se encuentra en procesamiento.

7. **3D Secure y antifraude**
   - Se conserva `device_session_id` de Openpay.
   - Se conserva el flujo de redirección 3D Secure cuando Openpay lo solicita.

## Paynet / SPEI

El checkout actual de Zapatería Angelita solo ofrece pago con tarjeta. Paynet y SPEI no se muestran como métodos disponibles, por lo tanto el requisito de validar la referencia de pago para efectivo o transferencia no aplica al alcance actual.

Si Paynet o SPEI se habilitan posteriormente, se deberá agregar el flujo de creación de cargo correspondiente, mostrar la referencia completa devuelta por Openpay y realizar las pruebas de certificación específicas de esos métodos.
