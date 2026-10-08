import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo.png";
import { Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa";

export function Footer() {
  return (
    <footer className="bg-yellow-300 py-12 text-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 justify-between gap-8">
          <div className="w-full md:w-auto text-center md:text-left">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center"
              aria-label="Job Soccer Logo"
            >
              <Image
                src={logo}
                alt="Job Soccer Logo"
                className="w-16"
              />
            </Link>
          </div>
          {/* Quick Action */}
          <div className="w-full md:w-auto text-center md:text-left">
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-800 hover:text-black font-medium text-sm transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href=""
                  className="text-gray-800 hover:text-black font-medium text-sm transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href=""
                  className="text-gray-800 hover:text-black font-medium text-sm transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href=""
                  className="text-gray-800 hover:text-black font-medium text-sm transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Policy */}
          <div className="w-full md:w-auto text-center md:text-left">
            <ul className="space-y-2">
              <li>
                <Link
                  href=""
                  className="text-gray-800 hover:text-black font-medium text-sm transition-colors"
                >
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link
                  href=""
                  className="text-gray-800 hover:text-black font-medium text-sm transition-colors"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <a
                  href="mailto:info@jobsoccer.com"
                  className="text-gray-800 hover:text-black font-medium text-sm transition-colors"
                >
                  <Mail className="inline mr-1" size={16} />
                  info@jobsoccer.com
                </a>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div className="w-full md:w-auto">
            <h3 className="lg:text-md font-semibold mb-4 text-center md:text-left text-gray-900">
              Subscribe To Our Newsletter
            </h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6">
              <Input
                type="email"
                placeholder="Enter your email"
                className="sm:flex-1 text-sm bg-white text-black placeholder:text-gray-500 p-5 border-gray-300"
              />
              <Button
                size="lg"
                className="bg-black hover:bg-gray-800 hover:scale-105 text-white font-medium px-4 py-3 rounded-lg transition-all"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
        <div className="pt-16">
          {/* Social Media Icons */}
          <div className="flex space-x-4 items-center justify-center gap-4">
            <Link
              href="https://www.facebook.com/share/1DkGxofpte/?mibextid=wwXIfr"
              target="_blank"
              className="text-blue-700 hover:text-blue-800 transition-colors"
            >
              <FaFacebook className="h-6 w-6" />
            </Link>
            <Link
              target="_blank"
              href="https://www.instagram.com/jobsoccer_fc?igsh=MTRvc2Jla24yaWEz&utm_source=qr"
              className="flex items-center justify-center h-6 w-6 rounded-full bg-linear-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:scale-110 transition-transform"
            >
              <FaInstagram className="h-4 w-4 text-white" />
            </Link>

            <Link
              target="_blank"
              href="https://www.linkedin.com/company/108544034/admin/dashboard"
              className="text-blue-700 hover:text-blue-800 transition-colors"
            >
              <FaLinkedin className="h-6 w-6" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
