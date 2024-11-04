import {NDKTag, NDKEvent, NDKUser} from "@nostr-dev-kit/ndk"
import {getZapAmount, getZappingUser} from "./nostr"
import {SortedMap} from "./SortedMap/SortedMap"
import socialGraph from "@/utils/socialGraph"
import {profileCache} from "@/utils/memcache"
import {base64} from "@scure/base"
import SnortApi from "./SnortApi"

interface ReactedTime {
  time: number
}

export interface Notification {
  id: string
  originalEventId: string
  users: SortedMap<string, ReactedTime>
  kind: number
  time: number
  content: string
  tags?: NDKTag[]
}

export const notifications = new SortedMap<string, Notification>([], "time")

// Define the NotificationOptions interface locally
interface NotificationOptions {
  body?: string
  icon?: string
  image?: string
  badge?: string
  tag?: string
  data?: unknown
  vibrate?: number[]
  renotify?: boolean
  silent?: boolean
  requireInteraction?: boolean
  actions?: NotificationAction[]
  dir?: "auto" | "ltr" | "rtl"
  lang?: string
  timestamp?: number
  noscreen?: boolean
  sticky?: boolean
  sound?: string
}

// Define the NotificationAction interface locally
interface NotificationAction {
  action: string
  title: string
  icon?: string
}

export const showNotification = (title: string, options?: NotificationOptions) => {
  if (window.Notification?.permission === "granted") {
    navigator.serviceWorker.ready.then(async function (serviceWorker) {
      await serviceWorker.showNotification(title, options)
    })
  } else {
    alert("Notifications are not allowed. Please enable them first.")
  }
}

const openedAt = Math.floor(Date.now() / 1000)

export async function maybeShowPushNotification(event: NDKEvent) {
  if (event.kind !== 9735 || event.created_at! < openedAt) {
    return
  }

  const user = getZappingUser(event)
  const amount = getZapAmount(event)
  let profile = profileCache.get(user)

  if (!profile) {
    const fetchProfileWithTimeout = (user: string) => {
      return Promise.race([
        new NDKUser({pubkey: user}).fetchProfile(),
        new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), 1000)),
      ])
    }

    const p = await fetchProfileWithTimeout(user)
    if (p?.name) {
      profile = p
    }
  }

  const name = profile?.name || profile?.username || "Someone"

  if (window.Notification?.permission === "granted") {
    showNotification(`${name} zapped you ${amount} sats!`, {
      icon: "/favicon.png",
      image: "/img/zap.png",
      sticky: false,
    })
  }
}

export async function subscribeToNotifications() {
  if (!CONFIG.features.pushNotifications) {
    return
  }

  // request permissions to send notifications
  if ("Notification" in window) {
    try {
      if (Notification.permission !== "granted") {
        await Notification.requestPermission()
      }
    } catch (e) {
      console.error(e)
    }
  }
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready
      if (reg) {
        const api = new SnortApi()
        const applicationServerKey = (await api.getPushNotificationInfo())
          .vapid_public_key

        // Check for existing subscription and unsubscribe if key is different
        const existingSub = await reg.pushManager.getSubscription()
        if (existingSub) {
          const existingKey = new Uint8Array(existingSub.options.applicationServerKey!)
          const newKey = new Uint8Array(Buffer.from(applicationServerKey, "base64"))

          if (
            existingKey.length !== newKey.length ||
            existingKey.some((byte, i) => byte !== newKey[i])
          ) {
            await existingSub.unsubscribe()
          }
        }

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        })

        const myKey = [...socialGraph().getUsersByFollowDistance(0)][0]
        const filter = {
          "#p": [myKey],
          kinds: [1, 6, 7],
        }
        await api.registerPushNotifications(
          {
            endpoint: sub.endpoint,
            p256dh: base64.encode(new Uint8Array(sub.getKey("p256dh")!)),
            auth: base64.encode(new Uint8Array(sub.getKey("auth")!)),
          },
          filter,
          myKey
        )
      }
    }
  } catch (e) {
    console.error(e)
  }
}
