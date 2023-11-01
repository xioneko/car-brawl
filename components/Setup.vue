<template>
    <div>
        <div v-if="progress === SetupProgress.ChooseFlavor">
            <!-- TODO -->
        </div>
        <div
            v-else-if="progress === SetupProgress.Startup"
            class="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-9"
        >
            <select id="guest-id" v-model="guestId" name="guestId">
                <option disabled selected value="">Mock a guest ID</option>
                <option v-for="n in 5" :key="n">
                    {{ `text_${_.repeat(n.toString(), 5)}` }}
                </option>
            </select>
            <div>
                <label for="name" class="pr-2">Name</label>
                <input
                    id="name"
                    v-model="name"
                    type="text"
                    placeholder="Anonymous"
                />
            </div>
            <div class="mode flex flex-row gap-4">
                <div
                    v-for="(label, roomType) in {
                        [RoomType.SingleRoom]: 'Single',
                        [RoomType.FunRoom]: 'Fun',
                        [RoomType.CompetitiveRoom]: 'Competitive',
                    }"
                    :key="roomType"
                >
                    <input
                        :id="roomType"
                        v-model="mode"
                        type="radio"
                        class="peer hidden"
                        :checked="roomType === RoomType.SingleRoom"
                        :value="roomType"
                    />
                    <label
                        :for="roomType"
                        class="cursor-pointer peer-checked:text-orange-400"
                        >{{ label }}</label
                    >
                </div>
            </div>
            <button class="inline-block" @click="joinGame">Let's Go</button>
        </div>
    </div>
</template>

<script lang="ts" setup>
import _ from 'lodash'
import { RoomType, type UserConfig } from '~/models'

enum SetupProgress {
    ChooseFlavor,
    Startup,
}
const progress = ref<SetupProgress>(SetupProgress.Startup)
const userConf = useUserConfigStore()
const account = useAccountStore()
const guestId = ref<string>('')
const name = ref<string>()
const mode = ref<RoomType>(RoomType.SingleRoom)

const emit = defineEmits<{
    onFinish: [gameMode: RoomType, userConfig: UserConfig, accessToken?: string]
}>()

function joinGame() {
    if (guestId.value) account.$patch({ guestId: guestId.value })
    if (name.value) userConf.$patch({ name: name.value })
    if (mode.value === RoomType.CompetitiveRoom) {
        // TODO: deploy 获取 token
        const accessToken = 'TODO'
        emit('onFinish', mode.value, userConf, accessToken)
    } else {
        emit('onFinish', mode.value, userConf)
    }
}
</script>

<style scoped>
* {
    user-select: none;
}
</style>
