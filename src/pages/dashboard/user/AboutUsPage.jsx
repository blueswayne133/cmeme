import React from "react";
import { useOutletContext } from "react-router-dom";
import {
  Users,
  Target,
  Eye,
  Zap,
  Shield,
  Globe,
  Twitter,
  Instagram,
  Facebook,
  Send,
} from "lucide-react";

const AboutUsPage = () => {
  const { userData } = useOutletContext();

  const features = [
    {
      icon: Target,
      title: "Our Mission",
      description:
        "To democratize cryptocurrency mining and make it accessible to everyone, regardless of technical expertise or financial background.",
    },
    {
      icon: Eye,
      title: "Our Vision",
      description:
        "Creating a world where anyone can participate in the crypto economy and benefit from blockchain technology through simple, user-friendly platforms.",
    },
    {
      icon: Zap,
      title: "What We Do",
      description:
        "We provide a seamless mining experience with daily rewards, P2P trading capabilities, and multiple earning opportunities through tasks and referrals.",
    },
    {
      icon: Shield,
      title: "Security First",
      description:
        "Your security is our priority. We implement enterprise-grade security measures to protect your assets and personal information.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description:
        "Serving users worldwide with a platform that supports multiple currencies and languages, making crypto mining accessible globally.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Built by the community, for the community. We value every user's feedback and continuously improve based on your suggestions.",
    },
  ];

  const stats = [
    { value: "50,000+", label: "Active Users" },
    { value: "$10M+", label: "Total Rewards Distributed" },
    { value: "150+", label: "Countries Supported" },
    { value: "99.9%", label: "Platform Uptime" },
  ];

  const socials = [
    {
      name: "X (Twitter)",
      icon: Twitter,
      handle: "@CmemeToken",
      link: "https://twitter.com/CmemeToken",
      color: "from-blue-400 to-blue-600",
    },
    {
      name: "Telegram",
      icon: Send,
      handle: "@CmemeToken",
      link: "https://t.me/CmemeToken",
      color: "from-sky-400 to-sky-600",
    },
    {
      name: "Instagram",
      icon: Instagram,
      handle: "@CmemeToken",
      link: "https://instagram.com/CmemeToken",
      color: "from-pink-500 to-yellow-500",
    },
    {
      name: "Facebook",
      icon: Facebook,
      handle: "@CmemeToken",
      link: "https://facebook.com/CmemeToken",
      color: "from-blue-500 to-indigo-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-100">About CMEME Token</h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Revolutionizing cryptocurrency mining with innovation, security, and
          user-centric design
        </p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl p-8 border border-purple-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-gray-100 mb-4">
            Welcome to the Future of Crypto Mining
          </h2>
          <p className="text-gray-300 text-lg leading-relaxed">
            CMEME Token was born from a simple idea: cryptocurrency mining
            should be accessible to everyone. We've eliminated the technical
            barriers and high costs traditionally associated with mining,
            creating a platform where anyone can start earning crypto rewards in
            just a few clicks.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500">
                  <IconComponent size={24} className="text-gray-900" />
                </div>
                <h3 className="text-xl font-bold text-gray-100">
                  {feature.title}
                </h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
        <h2 className="text-2xl font-bold text-gray-100 text-center mb-8">
          Our Impact in Numbers
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">
                {stat.value}
              </div>
              <div className="text-gray-400 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-100 mb-4">Our Values</h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>
                <strong>Transparency:</strong> Open communication about our
                operations and rewards
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>
                <strong>Innovation:</strong> Continuously improving our platform
                with new features
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>
                <strong>Accessibility:</strong> Making crypto mining available
                to everyone
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>
                <strong>Community:</strong> Building together with our users
              </span>
            </li>
          </ul>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
          <h3 className="text-xl font-bold text-gray-100 mb-4">
            Why Choose CMEME?
          </h3>
          <ul className="space-y-3 text-gray-400">
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Daily mining rewards with no hardware investment</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>
                Multiple earning opportunities through tasks and referrals
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Secure P2P trading platform</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>Regular platform updates and new features</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">•</span>
              <span>24/7 customer support</span>
            </li>
          </ul>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-2xl p-8 border border-blue-500/20">
        <h3 className="text-2xl font-bold text-gray-100 mb-4">
          Join Our Growing Community
        </h3>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Be part of the revolution in cryptocurrency mining. Start your journey
          today and discover how easy and rewarding crypto mining can be.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-semibold hover:opacity-90 transition-opacity">
            Start Mining Now
          </button>
          <button className="px-6 py-3 rounded-xl bg-gray-700 text-gray-200 font-semibold hover:bg-gray-600 transition-colors">
            Learn More
          </button>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="text-center bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 mt-8">
        <h3 className="text-2xl font-bold text-gray-100 mb-6">
          Connect With Us
        </h3>
        <div className="flex flex-wrap justify-center gap-4">
          {socials.map((social, index) => {
            const Icon = social.icon;
            return (
              <a
                key={index}
                href={social.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r ${social.color} text-gray-900 font-semibold hover:scale-105 transition-transform`}
              >
                <Icon size={20} className="text-gray-900" />
                <span>{social.name}</span>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
