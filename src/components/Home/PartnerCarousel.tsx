'use client'

import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'

interface Partner {
  id: number
  name: string
}

interface PartnerCarouselProps {
  partners: Partner[]
}

export default function PartnerCarousel({ partners }: PartnerCarouselProps) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 1500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  }

  return (
    <div className="mb-24 px-4">
      <Slider {...settings}>
        {partners.map((partner) => (
          <div key={partner.id} className="px-2">
            <div className="border border-gray-200 rounded-lg p-6 md:p-8 flex items-center justify-center hover:border-gray-300 transition-colors">
              <div className="w-full h-32 md:h-40 bg-gray-100 rounded-md flex flex-col items-center justify-center p-4">
                <svg
                  className="w-12 h-12 text-gray-400 mb-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="text-gray-500 text-sm text-center">
                  {partner.name} Logo
                </span>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  )
}
