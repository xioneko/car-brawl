import { PlayerCtrl } from '~/models/playerCtrl'

export const useControl = () => {
    const ctrl = reactive<PlayerCtrl>({
        forward: false,
        backward: false,
        left: false,
        right: false,
        shoot: false,
    })
    const listener = (on: boolean) => (e: KeyboardEvent) => {
        switch (e.key) {
            case 'w':
                ctrl.forward = on
                break
            case 's':
                ctrl.backward = on
                break
            case 'a':
                ctrl.left = on
                break
            case 'd':
                ctrl.right = on
                break
            case ' ':
                ctrl.shoot = on
                break
        }
    }
    const keyActive = listener(true)
    const keyInactive = listener(false)

    addEventListener('keydown', keyActive)
    addEventListener('keyup', keyInactive)

    onUnmounted(() => {
        removeEventListener('keydown', keyActive)
        removeEventListener('keyup', keyInactive)
    })

    return ctrl
}
