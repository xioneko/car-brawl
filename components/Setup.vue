<template>
    <div>
        <div v-if="progress === SetupProgress.ChooseFlavor">
            <!-- TODO -->
        </div>
        <div v-else-if="progress === SetupProgress.Startup">
            <select id="guestID" ref="select" name="guestId">
                <option value="test_11111" selected>mock_11111</option>
                <option value="test_22222">mock_22222</option>
                <option value="test_33333">mock_33333</option>
                <option value="test_44444">mock_44444</option>
                <option value="test_55555">mock_55555</option>
            </select>
            <button @click="joinGame(RoomType.SingleRoom)">Single</button>
            <button @click="joinGame(RoomType.FunRoom)">Fun</button>
            <button @click="joinGame(RoomType.CompetitiveRoom)">
                Competitive
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { RoomType, type UserConfig } from '~/models'

enum SetupProgress {
    ChooseFlavor,
    Startup,
}
const progress = ref<SetupProgress>(SetupProgress.Startup)
const userConf = useUserConfigStore()
const account = useAccountStore()
const select = ref<HTMLSelectElement | null>()

const emit = defineEmits<{
    onFinish: [gameMode: RoomType, userConfig: UserConfig, accessToken?: string]
}>()

function joinGame(gameMode: RoomType) {
    account.$patch({ guestId: select.value?.value ?? 'unknown' })
    if (gameMode === RoomType.CompetitiveRoom) {
        // TODO: deploy 获取 token
        const accessToken = 'TODO'
        emit('onFinish', gameMode, userConf, accessToken)
    } else {
        emit('onFinish', gameMode, userConf)
    }
}
</script>

<style lang="less"></style>
