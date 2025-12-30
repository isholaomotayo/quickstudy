"use client";

import {
	ArrowLeft,
	ChevronDown,
	ChevronUp,
	GraduationCap,
	Mail,
	MessageCircle,
	Phone,
	Search,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import KnowledgeBaseData from "./data";
import { useUser } from "@/contexts/AppContext";
import { api } from "@/lib/api-wrapper";

export default function HelpSupportPage() {
	const [mounted, setMounted] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [expandedFaq, setExpandedFaq] = useState(null);
	const [roleData, setRoleData] = useState(
		KnowledgeBaseData.getByRole("student"),
	);
	const [filteredKnowledge, setFilteredKnowledge] = useState([]);
	const [institutionData, setInstitutionData] = useState(null);
	const { userData, isLoading } = useUser();

	useEffect(() => {
		setMounted(true);
		// Get user role from AppContext (secure, verified)
		if (!isLoading && userData) {
			const currentRole = userData.role || "student"; // Default to student if no role

			const data = KnowledgeBaseData.getByRole(currentRole);
			setRoleData(data);
			setFilteredKnowledge(data.knowledgeBase);

			// Fetch institution data if we have institution_id
			if (userData.institution_id) {
				api.post("/api/institution/params", { id: userData.institution_id })
					.then((result) => {
						const institutionApiResponse = result.data || result;
						const institution = institutionApiResponse.data || institutionApiResponse;
						setInstitutionData(institution);
					})
					.catch((err) => {
						console.error("Error fetching institution data:", err);
					});
			}
		}
	}, [userData, isLoading]);

	useEffect(() => {
		if (searchQuery && roleData.knowledgeBase) {
			const filtered = roleData.knowledgeBase.filter(
				(item) =>
					item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
					item.category.toLowerCase().includes(searchQuery.toLowerCase()),
			);
			setFilteredKnowledge(filtered);
		} else {
			setFilteredKnowledge(roleData.knowledgeBase || []);
		}
	}, [searchQuery, roleData]);

	if (!mounted) return null;

	const supportPhone = "+2348167667864";
	const supportEmail =
		institutionData?.support_mail ||
		institutionData?.email ||
		"support@quickstudy.ng";

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Link href="/" className="flex items-center space-x-4">
								<Button variant="ghost" size="sm" className="gap-2">
									<ArrowLeft className="w-4 h-4" />
									Back to Dashboard
								</Button>
							</Link>
							<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
								<GraduationCap className="w-6 h-6 text-white" />
							</div>
							<h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								Help & Support
							</h1>
						</div>
					</div>
				</div>
			</header>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				{/* Hero Section */}
				<div className="text-center mb-12 animate-in fade-in duration-700">
					<h2 className="text-4xl font-bold text-gray-900 mb-4">
						How can we help you?
					</h2>
					<p className="text-lg text-gray-600 mb-8">
						Find answers to your questions or get in touch with our support team
					</p>

					{/* Contact Options */}
					<div className="flex justify-center gap-4 mb-8">
						<Dialog>
							<DialogTrigger asChild>
								<Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 gap-2">
									<MessageCircle className="w-4 h-4" />
									WhatsApp Chat
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-white/90 backdrop-blur-sm">
								<DialogHeader>
									<DialogTitle className="flex items-center gap-2">
										<MessageCircle className="w-5 h-5 text-blue-600" />
										WhatsApp Support
									</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<p className="text-gray-600">
										Connect with our support team on WhatsApp for real-time
										assistance.
									</p>
									<div className="bg-blue-50 p-4 rounded-lg">
										<p className="text-sm text-blue-800 font-medium">
											Available Hours:
										</p>
										<p className="text-sm text-blue-700">
											Monday - Friday: 8:00 AM - 6:00 PM
										</p>
										<p className="text-sm text-blue-700">
											Saturday: 9:00 AM - 2:00 PM
										</p>
										<p className="text-lg font-bold text-blue-700 mt-2">
											{supportPhone}
										</p>
									</div>
									<a
										href={`https://wa.me/${supportPhone.replace(/[^\d]/g, "")}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600">
											Start WhatsApp Chat
										</Button>
									</a>
								</div>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									className="gap-2 bg-white/50 backdrop-blur-sm"
								>
									<Phone className="w-4 h-4" />
									Call Support
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-white/90 backdrop-blur-sm">
								<DialogHeader>
									<DialogTitle className="flex items-center gap-2">
										<Phone className="w-5 h-5 text-emerald-600" />
										Call Support
									</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<p className="text-gray-600">
										Speak directly with our support team.
									</p>
									<div className="bg-emerald-50 p-4 rounded-lg space-y-2">
										<div>
											<p className="text-sm text-emerald-800 font-medium">
												Support Line:
											</p>
											<p className="text-lg font-bold text-emerald-700">
												{supportPhone}
											</p>
										</div>
									</div>
									<a href={`tel:${supportPhone}`}>
										<Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600">
											Call Now
										</Button>
									</a>
								</div>
							</DialogContent>
						</Dialog>

						<Dialog>
							<DialogTrigger asChild>
								<Button
									variant="outline"
									className="gap-2 bg-white/50 backdrop-blur-sm"
								>
									<Mail className="w-4 h-4" />
									Email Us
								</Button>
							</DialogTrigger>
							<DialogContent className="bg-white/90 backdrop-blur-sm">
								<DialogHeader>
									<DialogTitle className="flex items-center gap-2">
										<Mail className="w-5 h-5 text-purple-600" />
										Email Support
									</DialogTitle>
								</DialogHeader>
								<div className="space-y-4">
									<p className="text-gray-600">
										Send us an email and we'll get back to you within 24 hours.
									</p>
									<div className="bg-purple-50 p-4 rounded-lg space-y-2">
										<div>
											<p className="text-sm text-purple-800 font-medium">
												Support Email:
											</p>
											<p className="text-purple-700 font-medium">
												{supportEmail}
											</p>
										</div>
									</div>
									<a href={`mailto:${supportEmail}`}>
										<Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600">
											Open Email Client
										</Button>
									</a>
								</div>
							</DialogContent>
						</Dialog>
					</div>
				</div>

				{/* Search Knowledge Base */}
				<Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg mb-8 animate-in slide-in-from-top duration-700">
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-xl">
							<Search className="w-5 h-5 text-blue-600" />
							Search Knowledge Base
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<Input
								placeholder="Search for articles, guides, and solutions..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 bg-white/50 backdrop-blur-sm border-gray-200"
							/>
						</div>
					</CardContent>
				</Card>

				{/* Knowledge Base Grid */}
				<div className="mb-12">
					<h3 className="text-2xl font-bold text-gray-900 mb-6">
						Knowledge Base
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredKnowledge.map((item, index) => (
							<Card
								key={item.title}
								className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer animate-in slide-in-from-bottom"
								style={{ animationDelay: `${index * 100}ms` }}
							>
								<CardContent className="p-6">
									<div className="flex items-start gap-4">
										<div
											className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center text-white`}
										>
											<item.icon className="w-6 h-6" />
										</div>
										<div className="flex-1">
											<div className="flex items-center gap-2 mb-2">
												<h4 className="font-bold text-gray-900">
													{item.title}
												</h4>
												<Badge variant="secondary" className="text-xs">
													{item.category}
												</Badge>
											</div>
											<p className="text-sm text-gray-600">
												{item.description}
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</div>

				{/* FAQs Section */}
				<div>
					<h3 className="text-2xl font-bold text-gray-900 mb-6">
						Frequently Asked Questions
					</h3>
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						{roleData.faqs?.map((category, categoryIndex) => (
							<Card
								key={category.category}
								className="bg-white/70 backdrop-blur-sm border-0 shadow-lg animate-in slide-in-from-left"
								style={{ animationDelay: `${categoryIndex * 200}ms` }}
							>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<div
											className={`w-8 h-8 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center text-white`}
										>
											<category.icon className="w-4 h-4" />
										</div>
										{category.category}
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									{category.questions.map((faq, index) => (
										<div
											key={index}
											className="border-b border-gray-100 last:border-b-0 pb-4 last:pb-0"
										>
											<button
												type="button"
												onClick={() =>
													setExpandedFaq(
														expandedFaq === `${category.category}-${index}`
															? null
															: `${category.category}-${index}`,
													)
												}
												className="flex items-center justify-between w-full text-left"
											>
												<span className="font-medium text-gray-900 text-sm">
													{faq.question}
												</span>
												{expandedFaq === `${category.category}-${index}` ? (
													<ChevronUp className="w-4 h-4 text-gray-500" />
												) : (
													<ChevronDown className="w-4 h-4 text-gray-500" />
												)}
											</button>
											{expandedFaq === `${category.category}-${index}` && (
												<div className="mt-2 text-sm text-gray-600 animate-in slide-in-from-top duration-200">
													{faq.answer}
												</div>
											)}
										</div>
									))}
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
