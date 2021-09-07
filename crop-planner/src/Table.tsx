import { PureComponent } from "react";
import { sortBy } from "lodash";

import CropSelect from "./CropSelect";
import { Crop, Field, SeasonalCrop } from "./types";
import { fetchCrops, fetchFields, fetchHumusBalance } from "./api";
import buildNewFieldsState from "./buildNewFieldsState";

type Props = {};

type State = {
  allCrops: Array<Crop>;
  fields: Array<Field>;
  humusBalances: { [key: number]: number };
};

export default class Table extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      allCrops: [],
      fields: [],
      humusBalances: {},
    };
  }

  updateInitialHumusBalance(field: Field, balance: number): void {
    const humusBalances = {
      ...this.state.humusBalances,
    };
    humusBalances[field.id] = balance;
    this.setState({
      humusBalances: humusBalances,
    });
  }

  componentDidMount = async () => {
    let fields = await fetchFields();
    fields.forEach((field) =>
      fetchHumusBalance(field.crops).then((humusBalance) => {
        field.humusBalance = humusBalance;
        this.updateInitialHumusBalance(field, humusBalance);
        this.setState({ fields: { ...fields } });
      })
    );

    this.setState({
      fields: fields,
      allCrops: await fetchCrops(),
    });
  };

  changeFieldCrop = (
    newCrop: Crop | null,
    fieldId: number,
    cropYear: number
  ) => {
    const updatedFields = buildNewFieldsState(
      this.state.fields,
      newCrop,
      fieldId,
      cropYear
    ).fields;
    const updatedField = updatedFields.find(
      (field) => field.id === fieldId
    ) as Field;
    updatedField.humusBalance = 0;
    this.setState({ fields: updatedFields });

    // Update the humus balance status
    fetchHumusBalance(updatedField.crops).then((balance) => {
      updatedField.humusBalance = balance;
      this.setState({ fields: { ...updatedFields } });
    });
  };

  renderCropCell = (field: Field, seasonalCrop: SeasonalCrop) => (
    <div className='table__cell table__cell--center table__cell--with-select'>
      <CropSelect
        selectedCrop={seasonalCrop.crop}
        allCrops={this.state.allCrops}
        onChange={(newCrop) =>
          this.changeFieldCrop(newCrop, field.id, seasonalCrop.year)
        }
      />
    </div>
  );

  render = () => (
    <div className='table'>
      <div className='table__row table__row--header'>
        <div className='table__cell'>Field name</div>
        <div className='table__cell table__cell--right'>Field area (ha)</div>
        <div className='table__cell table__cell--center'>2020 crop</div>
        <div className='table__cell table__cell--center'>2021 crop</div>
        <div className='table__cell table__cell--center'>2022 crop</div>
        <div className='table__cell table__cell--center'>2023 crop</div>
        <div className='table__cell table__cell--center'>2024 crop</div>
        <div className='table__cell table__cell--right'>Humus balance</div>
      </div>

      {sortBy(this.state.fields, (field) => field.name).map((field) =>
        this.renderFieldRow(field)
      )}
    </div>
  );

  renderFieldRow = (field: Field) => (
    <div className='table__row' key={field.id}>
      <div className='table__cell'>{field.name}</div>
      <div className='table__cell table__cell--right'>{field.area}</div>

      {sortBy(field.crops, (crop) => crop.year).map((seasonalCrop) =>
        this.renderCropCell(field, seasonalCrop)
      )}

      <div
        className={
          "table__cell table__cell--right" +
          this.getHumusBalanceFeedbackClass(field)
        }>
        {field.humusBalance != null ? field.humusBalance : "Please wait"}
      </div>
    </div>
  );

  getHumusBalanceFeedbackClass(field: Field): string {
    if (
      field.humusBalance == null ||
      this.state.humusBalances[field.id] === field.humusBalance
    ) {
      return "humus_balance_initial";
    }
    return this.state.humusBalances[field.id] <
      field.humusBalance
      ? " humus_balance_increase"
      : " humus_balance_decrease";
  }
}
