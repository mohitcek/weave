from sklearn.datasets import fetch_california_housing

import weave_query as weave
import weave_query


# TODO: this should return a Weave type, not a raw dataframe
@weave.op(
    name="shap-ca_housing_dataset",
    render_info={"type": "function"},
    output_type=weave_query.ops.DataFrameType(weave.types.TypedDict({})),
)
def ca_housing_dataset(seed: int):
    housing = fetch_california_housing(as_frame=True)
    housingdf = housing.frame
    return housingdf
