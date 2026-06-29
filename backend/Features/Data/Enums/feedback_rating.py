# [Layer: Data/Enums] — feedback_rating.py
# Enum: 1-5 stars — visitor rating values.
# Do NOT put logic or computation here.

from django.db import models


class FeedbackRating(models.IntegerChoices):
    ONE_STAR = 1, '1 Star'
    TWO_STARS = 2, '2 Stars'
    THREE_STARS = 3, '3 Stars'
    FOUR_STARS = 4, '4 Stars'
    FIVE_STARS = 5, '5 Stars'
