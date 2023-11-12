import _ from 'lodash'
import Color from 'color'
import { createAvatar } from '@dicebear/core'
import { bottts } from '@dicebear/collection'

const Styles = {
    eyes: [
        'bulging',
        'dizzy',
        'eva',
        'frame1',
        'frame2',
        'glow',
        'happy',
        'hearts',
        'robocop',
        'round',
        'roundFrame01',
        'roundFrame02',
        'sensor',
        'shade01',
    ],
    face: [
        'round01',
        'round02',
        'square01',
        'square02',
        'square03',
        'square04',
    ],
    mouth: [
        'bite',
        'diagram',
        'grill01',
        'grill02',
        'grill03',
        'smile01',
        'smile02',
        'square01',
        'square02',
    ],
    sides: [
        'antenna01',
        'antenna02',
        'cables01',
        'cables02',
        'round',
        'square',
        'squareAssymetric',
    ],
    top: [
        'antenna',
        'antennaCrooked',
        'bulb01',
        'glowingBulb01',
        'glowingBulb02',
        'horns',
        'lights',
        'pyramid',
        'radar',
    ],
}

export function useAvatar() {
    const randomElem = (options: any[]) =>
        options[_.random(0, options.length - 1)]

    const avatar = createAvatar(bottts, {
        baseColor: [
            Color.hsl((_.random(0, 150) + 260) % 361, 100, 75)
                .hex()
                .slice(1),
        ],
        eyes: [randomElem(Styles.eyes)],
        face: [randomElem(Styles.face)],
        mouth: [randomElem(Styles.mouth)],
        sides: [randomElem(Styles.sides)],
        top: [randomElem(Styles.top)],
    }).toDataUriSync()

    return avatar
}
