"use client"

import { useState, useEffect } from "react"
import { Icon } from "@/components/ui/icon"
import { Button } from "@/components/ui/button"
import { GetInstantShippingQuoteModal } from "./get-instant-shipping-quote-modal"
import { api } from "@/lib/api"
import type { UserProfile } from "@/lib/api/types"

export function WelcomeBanner() {
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userProfileData = await api.profile.getProfile()
        setUserProfile(userProfileData)
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // Set userProfile to null if API fails - no fallback mock data
        setUserProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const displayName = userProfile 
    ? `${userProfile.first_name} ${userProfile.last_name}`
    : 'Loading...'
  
  const businessName = userProfile?.business_name || 'Your Business'
  const location = userProfile?.city && userProfile?.province && userProfile?.country
    ? `${userProfile.city}, ${userProfile.province}, ${userProfile.country}`
    : 'Loading...'

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {/* Left side - Content */}
          <div className="flex-1 pr-8">
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-gray-900 -mt-4">
                Welcome back, {displayName.split(' ')[0]}!
              </h1>
              <p className="text-gray-600 mt-1">
                Here&apos;s what&apos;s happening with your shipments today.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {businessName}
              </p>
            </div>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3 mb-4">
              <Button 
                onClick={() => setShowQuoteModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Icon name="Plus" size={16} className="mr-2" />
                Quick Quote
              </Button>
            </div>

            {/* Last Updated */}
            <div className="flex items-center space-x-2">
              <Icon name="Bell" size={20} className="text-gray-400" />
              <span className="text-sm text-gray-500">Last updated: 2 minutes ago</span>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="flex-shrink-0 flex items-center justify-center mt-4">
            <div className="w-48 h-32 flex items-center justify-center">
              <svg 
                width="192" 
                height="135" 
                viewBox="0 0 217 153" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
                aria-label="Shipping box illustration"
              >
                <g clipPath="url(#clip0_56_112)">
                  <path fillRule="evenodd" clipRule="evenodd" d="M207.458 35.0084C212.47 35.0084 216.534 39.072 216.534 44.0847C216.534 49.0974 212.47 53.161 207.458 53.161H155.593C160.606 53.161 164.669 57.2245 164.669 62.2372C164.669 67.2499 160.606 71.3135 155.593 71.3135H184.119C189.131 71.3135 193.195 75.3771 193.195 80.3898C193.195 85.4025 189.131 89.466 184.119 89.466H170.927C164.607 89.466 159.483 93.5296 159.483 98.5423C159.483 101.884 162.076 104.91 167.263 107.619C172.275 107.619 176.339 111.682 176.339 116.695C176.339 121.708 172.275 125.771 167.263 125.771H59.6441C54.6314 125.771 50.5678 121.708 50.5678 116.695C50.5678 111.682 54.6314 107.619 59.6441 107.619H9.07627C4.06358 107.619 0 103.555 0 98.5423C0 93.5296 4.06358 89.466 9.07627 89.466H60.9407C65.9534 89.466 70.017 85.4025 70.017 80.3898C70.017 75.3771 65.9534 71.3135 60.9407 71.3135H28.5254C23.5127 71.3135 19.4492 67.2499 19.4492 62.2372C19.4492 57.2245 23.5127 53.161 28.5254 53.161H80.3898C75.3771 53.161 71.3136 49.0974 71.3136 44.0847C71.3136 39.072 75.3771 35.0084 80.3898 35.0084H207.458ZM207.458 71.3135C212.47 71.3135 216.534 75.3771 216.534 80.3898C216.534 85.4025 212.47 89.466 207.458 89.466C202.445 89.466 198.381 85.4025 198.381 80.3898C198.381 75.3771 202.445 71.3135 207.458 71.3135Z" fill="#F3F7FF"/>
                  <path d="M52.188 80.7983C52.188 80.3615 52.4797 79.9781 52.9011 79.8615L100.874 66.5841C101.042 66.5371 101.223 66.5371 101.392 66.5841L149.364 79.8615C149.786 79.9781 150.078 80.3615 150.078 80.7983V135.684C150.078 136.112 149.797 136.49 149.388 136.615L101.416 151.22C101.232 151.276 101.035 151.276 100.849 151.22L52.8773 136.615C52.4678 136.49 52.188 136.112 52.188 135.684V80.7983Z" fill="white" stroke="#1F64E7" strokeWidth="3.24153" strokeLinejoin="round"/>
                  <path d="M147.165 85.5763V134.199L104.377 147.165L147.165 85.5763Z" fill="#E8F0FE"/>
                  <path d="M101.132 67.4237L150.4 80.3898L101.132 93.3559L51.8633 80.3898L101.132 67.4237Z" fill="#E8F0FE"/>
                  <path d="M50.2941 79.6132C50.6167 79.218 51.1413 79.0487 51.6342 79.1807L101.846 92.6351C102.754 92.8788 103.109 93.9784 102.514 94.7071L87.494 113.11C86.2039 114.69 84.1059 115.369 82.1338 114.84L36.289 102.555C34.4715 102.068 33.7613 99.8689 34.9512 98.4115L50.2941 79.6132Z" fill="white"/>
                  <mask id="mask0_56_112" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="34" y="79" width="69" height="37">
                    <path d="M50.2941 79.6132C50.6167 79.218 51.1413 79.0487 51.6342 79.1807L101.846 92.6351C102.754 92.8788 103.109 93.9784 102.514 94.7071L87.494 113.11C86.2039 114.69 84.1059 115.369 82.1338 114.84L36.289 102.555C34.4715 102.068 33.7613 99.8689 34.9512 98.4115L50.2941 79.6132Z" fill="white"/>
                  </mask>
                  <g mask="url(#mask0_56_112)">
                    <path d="M50.7953 82.3114L101.006 95.7664L102.685 89.5037L52.4732 76.0496L50.7953 82.3114ZM100.004 92.6571L84.9825 111.06L90.0055 115.158L105.025 96.757L100.004 92.6571ZM82.9727 111.708L37.128 99.4241L35.45 105.687L81.2949 117.971L82.9727 111.708ZM37.4624 100.46L52.8053 81.6631L47.7828 77.5635L32.4399 96.3615L37.4624 100.46ZM37.128 99.4241C37.5823 99.546 37.7599 100.096 37.4624 100.46L32.4399 96.3615C29.7628 99.6406 31.3605 104.591 35.45 105.687L37.128 99.4241ZM84.9825 111.06C84.4988 111.652 83.7118 111.907 82.9727 111.708L81.2949 117.971C84.4988 118.829 87.9076 117.728 90.0055 115.158L84.9825 111.06ZM101.006 95.7664C99.6432 95.4007 99.1103 93.7501 100.004 92.6571L105.025 96.757C107.108 94.2052 105.866 90.3556 102.685 89.5037L101.006 95.7664ZM52.4732 76.0496C50.7481 75.5874 48.9122 76.1799 47.7828 77.5635L52.8053 81.6631C52.3214 82.2557 51.5346 82.5098 50.7953 82.3114L52.4732 76.0496Z" fill="#1F64E7"/>
                  </g>
                  <path d="M87.2061 54.8643L101.046 67.1447L53.4462 79.8998L39.5222 67.5448C38.9427 67.0307 39.1677 66.0786 39.916 65.8781L83.9179 54.0874C85.0744 53.7773 86.3101 54.0691 87.2061 54.8643Z" fill="#E8F0FE" stroke="#1F64E7" strokeWidth="3.24153"/>
                  <path d="M114.782 54.8014L100.897 67.0753L148.704 79.886L162.669 67.5432C163.25 67.0296 163.025 66.076 162.276 65.8753L118.067 54.0289C116.911 53.7194 115.678 54.0095 114.782 54.8014Z" fill="#E8F0FE" stroke="#1F64E7" strokeWidth="3.24153"/>
                  <path d="M151.553 79.7951C151.23 79.4004 150.706 79.2315 150.214 79.3635L100.6 92.6582C99.6912 92.902 99.336 94.0028 99.9324 94.7315L114.725 112.823C116.017 114.401 118.113 115.077 120.083 114.549L165.331 102.424C167.149 101.938 167.859 99.7351 166.666 98.2778L151.553 79.7951Z" fill="white"/>
                  <mask id="mask1_56_112" style={{maskType: 'luminance'}} maskUnits="userSpaceOnUse" x="99" y="79" width="69" height="36">
                    <path d="M151.553 79.7951C151.23 79.4004 150.706 79.2315 150.214 79.3635L100.6 92.6582C99.6912 92.902 99.336 94.0028 99.9324 94.7315L114.725 112.823C116.017 114.401 118.113 115.077 120.083 114.549L165.331 102.424C167.149 101.938 167.859 99.7351 166.666 98.2778L151.553 79.7951Z" fill="white"/>
                  </mask>
                  <g mask="url(#mask1_56_112)">
                    <path d="M151.052 82.4941L101.439 95.7895L99.7611 89.5269L149.375 76.2323L151.052 82.4941ZM102.441 92.6789L117.236 110.771L112.216 114.874L97.4234 96.7827L102.441 92.6789ZM119.244 111.419L164.492 99.2942L166.17 105.556L120.922 117.68L119.244 111.419ZM164.157 100.33L149.044 81.847L154.063 77.743L169.176 96.2264L164.157 100.33ZM164.492 99.2942C164.037 99.4148 163.859 99.9659 164.157 100.33L169.176 96.2264C171.858 99.5056 170.26 104.46 166.17 105.556L164.492 99.2942ZM117.236 110.771C117.719 111.363 118.505 111.616 119.244 111.419L120.922 117.68C117.72 118.539 114.314 117.44 112.216 114.874L117.236 110.771ZM101.439 95.7895C102.803 95.4238 103.336 93.772 102.441 92.6789L97.4234 96.7827C95.3371 94.2323 96.5793 90.38 99.7611 89.5269L101.439 95.7895ZM149.375 76.2323C151.099 75.7705 152.933 76.3616 154.063 77.743L149.044 81.847C149.528 82.4396 150.315 82.6924 151.052 82.4941L149.375 76.2323Z" fill="#1F64E7"/>
                  </g>
                  <path d="M101.133 150.407V115.273M101.133 105.025V108.649" stroke="#1F64E7" strokeWidth="3.24153" strokeLinecap="round"/>
                  <path d="M101.133 68.7203V80.3898" stroke="#1F64E7" strokeWidth="3.24153" strokeLinecap="round"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M141.513 121.708L135.471 123.356C134.608 123.59 134.098 124.481 134.334 125.346C134.57 126.209 135.461 126.718 136.324 126.483L142.365 124.835C143.229 124.599 143.738 123.708 143.502 122.845C143.268 121.981 142.377 121.472 141.513 121.708ZM142.461 131.701C143.325 131.465 143.834 130.574 143.598 129.71C143.364 128.847 142.473 128.337 141.609 128.573L129.259 131.94C128.396 132.176 127.887 133.067 128.122 133.931C128.358 134.794 129.249 135.304 130.112 135.068L142.461 131.701Z" fill="#75A4FE"/>
                  <path d="M106.318 9.07629C108.467 9.07629 110.208 7.33482 110.208 5.18646C110.208 3.03811 108.467 1.29663 106.318 1.29663C104.17 1.29663 102.428 3.03811 102.428 5.18646C102.428 7.33482 104.17 9.07629 106.318 9.07629Z" stroke="#75A4FE" strokeWidth="2.59322"/>
                  <path d="M143.919 44.0847C146.067 44.0847 147.808 42.3432 147.808 40.1949C147.808 38.0465 146.067 36.3051 143.919 36.3051C141.77 36.3051 140.029 38.0465 140.029 40.1949C140.029 42.3432 141.77 44.0847 143.919 44.0847Z" fill="#75A4FE"/>
                  <path d="M114.098 23.339L124.935 34.1763M125.1 23.339L114.263 34.1763" stroke="#75A4FE" strokeWidth="3.24153" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M70.0156 35.7815L77.7953 43.5612M77.7953 35.7815L70.0156 43.5612" stroke="#75A4FE" strokeWidth="3.24153" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M87.643 27.2288C89.7915 27.2288 91.5328 25.4873 91.5328 23.3389C91.5328 21.1906 89.7915 19.4491 87.643 19.4491C85.4945 19.4491 83.7532 21.1906 83.7532 23.3389C83.7532 25.4873 85.4945 27.2288 87.643 27.2288Z" fill="#75A4FE"/>
                </g>
                <defs>
                  <clipPath id="clip0_56_112">
                    <rect width="216.534" height="153" fill="white"/>
                  </clipPath>
                </defs>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Get Instant Shipping Quote Modal */}
      <GetInstantShippingQuoteModal
        open={showQuoteModal}
        onOpenChange={setShowQuoteModal}
      />
    </>
  )
}
