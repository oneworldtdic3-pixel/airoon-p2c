import { spotSceneDataUri } from '../components/illust'
import type { SpotTag } from './types'

/** 목 사진: 스팟별 장면 × 시간대/구도 변형 */
export const sceneArt = (spot: SpotTag, seed = 0) => spotSceneDataUri(spot, seed)
