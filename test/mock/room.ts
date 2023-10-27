import { mockGuestAccount, mockRevAccount } from './account'
import { UserConfig } from '~/models/config'
import { GuestOptions, RegularOptions, RoomOptions } from '~/models/room'

export function mockRoomOptions(
    name: string,
    type: 'guest' | 'regular',
): RoomOptions {
    switch (type) {
        case 'guest':
            return new GuestOptions(mockGuestAccount(), new UserConfig(name))
        case 'regular':
            return new RegularOptions(
                mockRevAccount(),
                'accessToken', // TODO: 与 faucet 合约一同测试
                new UserConfig(name),
            )
    }
}
