from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import uuid
from datetime import datetime, timezone

from providers_data import HEALTH_PROVIDERS, LIFE_PROVIDERS

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Insurance Comparison API")
api_router = APIRouter(prefix="/api")


class QuoteRequest(BaseModel):
    category: Literal["health", "life"]
    age: int = Field(ge=18, le=85)
    coverage_amount: int = Field(gt=0)
    smoker: bool = False
    family_size: int = Field(ge=1, le=10, default=1)
    gender: Optional[Literal["male", "female", "other"]] = "other"
    term_years: Optional[int] = 20  # for life insurance


class ProviderQuote(BaseModel):
    id: str
    name: str
    logo: str
    rating: float
    reviews: int
    tagline: str
    monthly_premium: float
    annual_premium: float
    deductible: int
    coverage_amount: int
    max_out_of_pocket: Optional[int] = None
    term_years: Optional[int] = None
    network_size: Optional[str] = None
    payout_speed: Optional[str] = None
    features: List[str]
    benefits: List[str]
    exclusions: List[str]
    pros: List[str]
    cons: List[str]
    badge: Optional[str] = None
    accent_color: str


class QuoteResponse(BaseModel):
    id: str
    category: str
    generated_at: str
    request: QuoteRequest
    quotes: List[ProviderQuote]


class SavedComparison(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    provider_ids: List[str]
    category: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


def compute_quote(provider: dict, req: QuoteRequest) -> ProviderQuote:
    """Adjust base pricing per provider based on user inputs. Deterministic math."""
    base_monthly = provider["base_monthly"]
    coverage_ref = provider["coverage_reference"]

    # Coverage scaling
    coverage_factor = req.coverage_amount / coverage_ref

    # Age scaling — steeper for life insurance
    if req.category == "life":
        age_factor = 1 + max(0, (req.age - 30)) * 0.045
    else:
        age_factor = 1 + max(0, (req.age - 30)) * 0.022

    # Smoker surcharge
    smoker_factor = 1.55 if req.smoker else 1.0

    # Family scaling (health only)
    family_factor = 1 + (req.family_size - 1) * 0.35 if req.category == "health" else 1.0

    # Term factor (life only) — shorter term is cheaper
    term_factor = 1.0
    if req.category == "life" and req.term_years:
        term_factor = 0.55 + (req.term_years / 30) * 0.9

    monthly = base_monthly * coverage_factor * age_factor * smoker_factor * family_factor * term_factor
    monthly = round(monthly, 2)

    quote_data = {
        **provider,
        "monthly_premium": monthly,
        "annual_premium": round(monthly * 12, 2),
        "coverage_amount": req.coverage_amount,
    }
    if req.category == "life":
        quote_data["term_years"] = req.term_years

    # Remove internal fields
    quote_data.pop("base_monthly", None)
    quote_data.pop("coverage_reference", None)

    return ProviderQuote(**quote_data)


@api_router.get("/")
async def root():
    return {"message": "Insurance Comparison API", "version": "1.0"}


@api_router.get("/providers/{category}", response_model=List[ProviderQuote])
async def list_providers(category: Literal["health", "life"]):
    """Return baseline (non-personalized) provider data."""
    default_req = QuoteRequest(
        category=category,
        age=30,
        coverage_amount=500_000 if category == "life" else 100_000,
        smoker=False,
        family_size=1,
        term_years=20,
    )
    dataset = HEALTH_PROVIDERS if category == "health" else LIFE_PROVIDERS
    return [compute_quote(p, default_req) for p in dataset]


@api_router.post("/quote", response_model=QuoteResponse)
async def get_quotes(req: QuoteRequest):
    dataset = HEALTH_PROVIDERS if req.category == "health" else LIFE_PROVIDERS
    quotes = [compute_quote(p, req) for p in dataset]
    quotes.sort(key=lambda q: q.monthly_premium)

    resp = QuoteResponse(
        id=str(uuid.uuid4()),
        category=req.category,
        generated_at=datetime.now(timezone.utc).isoformat(),
        request=req,
        quotes=quotes,
    )

    try:
        await db.quote_history.insert_one(resp.model_dump())
    except Exception as e:
        logger.warning(f"Failed to log quote history: {e}")

    return resp


@api_router.post("/comparisons", response_model=SavedComparison)
async def save_comparison(comp: SavedComparison):
    await db.comparisons.insert_one(comp.model_dump())
    return comp


@api_router.get("/comparisons/{comp_id}", response_model=SavedComparison)
async def get_comparison(comp_id: str):
    doc = await db.comparisons.find_one({"id": comp_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Comparison not found")
    return SavedComparison(**doc)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
