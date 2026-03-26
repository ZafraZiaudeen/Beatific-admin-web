import Api from './api'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiData = any

const JOB_POLL_INTERVAL_MS = 2000

const JOB_MAX_WAIT_MS = 30 * 60 * 1000

export interface PdfJobStatus {
  success: boolean
  jobId?: string
  status?: 'pending' | 'processing' | 'complete' | 'failed'
  progress?: number
  totalPages?: number
  message?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: { pages: any[]; fonts: any[] }
  error?: string
  elapsed?: number | null
}

const MediaApi = {
  upload: (file: File): Promise<ApiData> => {
    const form = new FormData()
    form.append('file', file)
    return Api.post<ApiData>('/media/upload', form)
  },

  submitPdf: (file: File): Promise<ApiData> => {
    const form = new FormData()
    form.append('file', file)
    return Api.post<ApiData>('/pdf/decompose', form, {
      ignoreDuplicateCheck: true,
      timeout: 60_000,
    })
  },

  getJobStatus: (jobId: string): Promise<PdfJobStatus> => {
    return Api.get<PdfJobStatus>(`/pdf/job/${jobId}`)
  },

  removeJob: (jobId: string): Promise<ApiData> => {
    return Api.del<ApiData>(`/pdf/job/${jobId}`)
  },

  importPdf: async (
    file: File,
    onProgress?: (status: PdfJobStatus) => void,
  ): Promise<ApiData> => {
    const submitRes = await MediaApi.submitPdf(file)
    const jobId = submitRes.jobId as string

    if (!jobId) {
      return submitRes
    }

    const startTime = Date.now()

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          if (Date.now() - startTime > JOB_MAX_WAIT_MS) {
            reject(new Error('PDF processing timed out. Please try again with a smaller file.'))
            return
          }

          const status = await MediaApi.getJobStatus(jobId)
          onProgress?.(status)

          if (status.status === 'complete' && status.data) {
            // Clean up the job from server memory (fire-and-forget)
            MediaApi.removeJob(jobId).catch(() => {})
            resolve({ success: true, data: status.data })
            return
          }

          if (status.status === 'failed') {
            MediaApi.removeJob(jobId).catch(() => {})
            reject(new Error(status.error || status.message || 'PDF decomposition failed'))
            return
          }

          setTimeout(poll, JOB_POLL_INTERVAL_MS)
        } catch (err) {
          reject(err)
        }
      }

      poll()
    })
  },
}

export default MediaApi
