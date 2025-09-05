
import { promiseTimeout } from '@vueuse/core'

// https://github.com/xiaoluoboding/vue-sonner
export default function () {
  const toast = useToast()
  const activeToast = useState('activeToasts', () => false);
  const toastVibration = useState('toastVibration', () => false)
  const vibrateToast = async () => {
    console.log('gonna vibrate toast')
    if(activeToast.value) toastVibration.value = true
    await promiseTimeout(500)
    toastVibration.value = false

  }
  const triggerErrorMessage = (type, message, description, multiple) => {
    console.log('ACTIVE TOASTS?',activeToast.value)
    if(activeToast.value) return vibrateToast()
    activeToast.value = true
    if(type === 'error') {
      toast.error(message, {
        richColors: true,
        description,
        onDismiss: (t) => console.log(`Toast with id ${t.id} has been dismissed`),
        onAutoClose: (t) => {
          activeToast.value = false
          console.log(`Toast with id ${t.id} has been closed automatically`);
        }

      })
    }
    toastVibration.value = false

  }

  const foundErrors = () => {
    if(!useNetwork().isOnline.value) {
      triggerErrorMessage('error', 'Check your connection status.', null, false)
      return true
    }
    if(!useUserSession().loggedIn.value) {
      triggerErrorMessage('error', 'You are not logged in.', null, false)
      return true
    };
  }

  return {
    foundErrors,
    activeToast,
    toastVibration
  }

}
