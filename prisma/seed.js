"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var constants_1 = require("../src/lib/constants");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var settlements, systemAdmin, settlementAdmin, workers, campaigns, _loop_1, _i, campaigns_1, campaign, activeCampaign, images, sampleResponses, _a, images_1, image, responses, yesCount, noCount;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    console.log('🌱 Starting database seed...');
                    // Clear existing data
                    return [4 /*yield*/, prisma.response.deleteMany()];
                case 1:
                    // Clear existing data
                    _b.sent();
                    return [4 /*yield*/, prisma.dailyReport.deleteMany()];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, prisma.image.deleteMany()];
                case 3:
                    _b.sent();
                    return [4 /*yield*/, prisma.campaignSettlement.deleteMany()];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, prisma.campaign.deleteMany()];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, prisma.user.deleteMany()];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, prisma.settlement.deleteMany()];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, prisma.news.deleteMany()];
                case 8:
                    _b.sent();
                    console.log('🗑️  Cleared existing data');
                    return [4 /*yield*/, Promise.all(constants_1.SAMPLE_SETTLEMENTS.map(function (settlement) {
                            return prisma.settlement.create({
                                data: {
                                    name: settlement.name,
                                    location: settlement.location,
                                },
                            });
                        }))];
                case 9:
                    settlements = _b.sent();
                    console.log("\u2705 Created ".concat(settlements.length, " settlements"));
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                phone: '+254701234567',
                                role: client_1.UserRole.ADMIN,
                                // No settlementId - system-wide admin
                            },
                        })];
                case 10:
                    systemAdmin = _b.sent();
                    return [4 /*yield*/, prisma.user.create({
                            data: {
                                phone: '+254702345678',
                                role: client_1.UserRole.ADMIN,
                                settlementId: settlements[0].id, // Mji wa Huruma admin
                            },
                        })];
                case 11:
                    settlementAdmin = _b.sent();
                    console.log('👤 Created admin users (system + settlement-specific)');
                    return [4 /*yield*/, Promise.all([
                            prisma.user.create({
                                data: {
                                    phone: '+254712345678',
                                    role: client_1.UserRole.WORKER,
                                    settlementId: settlements[0].id, // Mji wa Huruma
                                },
                            }),
                            prisma.user.create({
                                data: {
                                    phone: '+254723456789',
                                    role: client_1.UserRole.WORKER,
                                    settlementId: settlements[1].id, // Kayole Soweto
                                },
                            }),
                            prisma.user.create({
                                data: {
                                    phone: '+254734567890',
                                    role: client_1.UserRole.WORKER,
                                    settlementId: settlements[2].id, // Kariobangi
                                },
                            }),
                        ])];
                case 12:
                    workers = _b.sent();
                    console.log("\uD83D\uDC77 Created ".concat(workers.length, " worker users"));
                    return [4 /*yield*/, Promise.all(constants_1.SAMPLE_QUESTIONS.map(function (question, index) {
                            return prisma.campaign.create({
                                data: {
                                    title: "Infrastructure Assessment ".concat(index + 1),
                                    question: question,
                                    isActive: index === 0, // Only first campaign is active
                                    createdBy: systemAdmin.id,
                                    startDate: new Date(),
                                    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
                                },
                            });
                        }))];
                case 13:
                    campaigns = _b.sent();
                    console.log("\uD83D\uDCCB Created ".concat(campaigns.length, " campaigns"));
                    _loop_1 = function (campaign) {
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, Promise.all(settlements.map(function (settlement) {
                                        return prisma.campaignSettlement.create({
                                            data: {
                                                campaignId: campaign.id,
                                                settlementId: settlement.id,
                                            },
                                        });
                                    }))];
                                case 1:
                                    _c.sent();
                                    return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, campaigns_1 = campaigns;
                    _b.label = 14;
                case 14:
                    if (!(_i < campaigns_1.length)) return [3 /*break*/, 17];
                    campaign = campaigns_1[_i];
                    return [5 /*yield**/, _loop_1(campaign)];
                case 15:
                    _b.sent();
                    _b.label = 16;
                case 16:
                    _i++;
                    return [3 /*break*/, 14];
                case 17:
                    console.log('🔗 Assigned campaigns to settlements');
                    activeCampaign = campaigns[0];
                    return [4 /*yield*/, Promise.all(constants_1.SAMPLE_IMAGE_URLS.map(function (url) {
                            return prisma.image.create({
                                data: {
                                    url: url,
                                    campaignId: activeCampaign.id,
                                },
                            });
                        }))];
                case 18:
                    images = _b.sent();
                    console.log("\uD83D\uDDBC\uFE0F  Created ".concat(images.length, " images for active campaign"));
                    sampleResponses = [
                        { worker: workers[0], image: images[0], answer: true },
                        { worker: workers[0], image: images[1], answer: false },
                        { worker: workers[1], image: images[0], answer: true },
                        { worker: workers[1], image: images[1], answer: true },
                        { worker: workers[2], image: images[0], answer: false },
                    ];
                    return [4 /*yield*/, Promise.all(sampleResponses.map(function (_a) {
                            var worker = _a.worker, image = _a.image, answer = _a.answer;
                            return prisma.response.create({
                                data: {
                                    userId: worker.id,
                                    imageId: image.id,
                                    answer: answer,
                                },
                            });
                        }))];
                case 19:
                    _b.sent();
                    console.log("\uD83D\uDCAC Created ".concat(sampleResponses.length, " sample responses"));
                    _a = 0, images_1 = images;
                    _b.label = 20;
                case 20:
                    if (!(_a < images_1.length)) return [3 /*break*/, 24];
                    image = images_1[_a];
                    return [4 /*yield*/, prisma.response.findMany({
                            where: { imageId: image.id },
                        })];
                case 21:
                    responses = _b.sent();
                    yesCount = responses.filter(function (r) { return r.answer === true; }).length;
                    noCount = responses.filter(function (r) { return r.answer === false; }).length;
                    return [4 /*yield*/, prisma.image.update({
                            where: { id: image.id },
                            data: {
                                totalResponses: responses.length,
                                yesCount: yesCount,
                                noCount: noCount,
                            },
                        })];
                case 22:
                    _b.sent();
                    _b.label = 23;
                case 23:
                    _a++;
                    return [3 /*break*/, 20];
                case 24:
                    console.log('📊 Updated image response counts');
                    // Create sample news items
                    return [4 /*yield*/, Promise.all([
                            prisma.news.create({
                                data: {
                                    title: 'Welcome to the DPW Platform!',
                                    content: 'Complete your daily tasks to earn KES 760 base pay plus quality bonuses.',
                                    priority: client_1.NewsPriority.HIGH,
                                    createdBy: systemAdmin.id,
                                },
                            }),
                            prisma.news.create({
                                data: {
                                    title: 'Payment Schedule Update',
                                    content: 'Payments are processed weekly every Friday. Check your earnings in the app.',
                                    priority: client_1.NewsPriority.MEDIUM,
                                    createdBy: systemAdmin.id,
                                },
                            }),
                            prisma.news.create({
                                data: {
                                    title: 'New Task Campaign Available',
                                    content: 'A new infrastructure assessment campaign is now live. Happy tasking!',
                                    priority: client_1.NewsPriority.LOW,
                                    createdBy: systemAdmin.id,
                                },
                            }),
                        ])];
                case 25:
                    // Create sample news items
                    _b.sent();
                    console.log('📰 Created sample news items');
                    console.log('🎉 Database seeding completed successfully!');
                    console.log('\n📝 Sample credentials:');
                    console.log('System Admin: +254701234567 (system-wide access)');
                    console.log('Settlement Admin: +254702345678 (Mji wa Huruma)');
                    console.log('Worker 1: +254712345678 (Mji wa Huruma)');
                    console.log('Worker 2: +254723456789 (Kayole Soweto)');
                    console.log('Worker 3: +254734567890 (Kariobangi)');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
