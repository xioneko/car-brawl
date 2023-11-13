import _ from 'lodash'
import type { CarCtrl } from '~/models/game'

const logger = useLogger('Control')

export const useCtrlSample = () => {
    const ctrl = reactive<CarCtrl>({
        forward: false,
        backward: false,
        left: false,
        right: false,
        shoot: false,
    })
    const keyListener = (on: boolean) => (e: KeyboardEvent) => {
        switch (e.key) {
            case 'w':
            case 'ArrowUp':
                ctrl.forward = on
                break
            case 's':
            case 'ArrowDown':
                ctrl.backward = on
                break
            case 'a':
            case 'ArrowLeft':
                ctrl.left = on
                break
            case 'd':
            case 'ArrowRight':
                ctrl.right = on
                break
            case ' ':
                ctrl.shoot = on
                break
        }
    }
    const keyActive = keyListener(true)
    const keyInactive = keyListener(false)
    const pageInactive = () => {
        if (document.visibilityState === 'hidden') {
            logger.debug('Page inactive')
            ctrl.forward = false
            ctrl.backward = false
            ctrl.left = false
            ctrl.right = false
            ctrl.shoot = false
        }
    }

    onMounted(() => {
        addEventListener('keydown', keyActive)
        addEventListener('keyup', keyInactive)
        addEventListener('visibilitychange', pageInactive)
    })

    onUnmounted(() => {
        removeEventListener('keydown', keyActive)
        removeEventListener('keyup', keyInactive)
        removeEventListener('visibilitychange', pageInactive)
    })

    return ctrl
}
