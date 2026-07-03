import { getTempoExplorerUrl } from './explorer'

interface ClipboardLike {
  writeText: (text: string) => Promise<void>
}

type OpenExplorer = (
  url: string,
  target: '_blank',
  features: 'noopener,noreferrer',
) => unknown

interface ExplorerActionDeps {
  clipboard?: ClipboardLike | null | undefined
  open?: OpenExplorer | undefined
}

function browserClipboard(): ClipboardLike | null {
  if (typeof navigator === 'undefined') return null
  return navigator.clipboard ?? null
}

function browserOpen(): OpenExplorer | undefined {
  if (typeof window === 'undefined') return undefined
  return (url, target, features) => window.open(url, target, features)
}

export async function copyTransactionHash(
  txHash: string,
  deps: Pick<ExplorerActionDeps, 'clipboard'> = {},
): Promise<boolean> {
  const clipboard = deps.clipboard ?? browserClipboard()
  if (!clipboard) return false

  try {
    await clipboard.writeText(txHash)
    return true
  } catch {
    return false
  }
}

export async function copyHashAndOpenTempoExplorer(
  txHash: string,
  deps: ExplorerActionDeps = {},
): Promise<{ copied: boolean; opened: boolean }> {
  const clipboard = deps.clipboard ?? browserClipboard()
  const open = deps.open ?? browserOpen()
  let copy: Promise<void>
  try {
    copy = clipboard
      ? clipboard.writeText(txHash)
      : Promise.reject(new Error('Clipboard unavailable'))
  } catch (error) {
    copy = Promise.reject(error)
  }

  const opened = open
    ? open(getTempoExplorerUrl(), '_blank', 'noopener,noreferrer') !== null
    : false

  try {
    await copy
    return { copied: true, opened }
  } catch {
    return { copied: false, opened }
  }
}
