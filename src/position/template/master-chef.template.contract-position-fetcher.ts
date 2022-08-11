import { Inject } from '@nestjs/common';
import { BigNumberish, Contract } from 'ethers';
import { range } from 'lodash';

import { APP_TOOLKIT, IAppToolkit } from '~app-toolkit/app-toolkit.interface';
import { BLOCKS_PER_DAY } from '~app-toolkit/constants/blocks';
import { RewardRateUnit } from '~app-toolkit/helpers/master-chef/master-chef.contract-position-helper';
import { getLabelFromToken } from '~app-toolkit/helpers/presentation/image.present';
import { MetaType } from '~position/position.interface';
import { isClaimable, isSupplied } from '~position/position.utils';
import {
  ContractPositionTemplatePositionFetcher,
  DataPropsStageParams,
  DisplayPropsStageParams,
  GetTokenBalancesPerPositionParams,
  TokenStageParams,
  UnderlyingTokenDescriptor,
} from '~position/template/contract-position.template.position-fetcher';

export type MasterChefContractPositionDataProps = {
  poolIndex: number;
  liquidity: number;
  isActive: boolean;
  dailyROI: number;
  weeklyROI: number;
  yearlyROI: number;
};

export type MasterChefContractPositionDescriptor = {
  address: string;
  poolIndex: number;
};

export abstract class MasterChefTemplateContractPositionFetcher<
  T extends Contract,
  V extends MasterChefContractPositionDataProps = MasterChefContractPositionDataProps,
> extends ContractPositionTemplatePositionFetcher<T, V, MasterChefContractPositionDescriptor> {
  constructor(@Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit) {
    super(appToolkit);
  }

  abstract chefAddress: string;
  abstract getPoolLength(contract: T): Promise<BigNumberish>;
  abstract getStakedTokenAddress(contract: T, poolIndex: number): Promise<string>;
  abstract getRewardTokenAddress(contract: T, poolIndex: number): Promise<string>;

  // APY
  rewardRateUnit: RewardRateUnit = RewardRateUnit.BLOCK;
  abstract getTotalAllocPoints(contract: T, poolIndex: number): Promise<BigNumberish>;
  abstract getTotalRewardRate(contract: T, poolIndex: number): Promise<BigNumberish>;
  abstract getPoolAllocPoints(contract: T, poolIndex: number): Promise<BigNumberish>;

  // Balances
  abstract getStakedTokenBalance(address: string, contract: T, poolIndex: number): Promise<BigNumberish>;
  abstract getRewardTokenBalance(address: string, contract: T, poolIndex: number): Promise<BigNumberish>;

  async getDescriptors() {
    const poolLength = await this.getContract(this.chefAddress).poolLength();
    return range(0, Number(poolLength)).map(poolIndex => ({ address: this.chefAddress, poolIndex }));
  }

  async getTokenDescriptors({
    contract,
    descriptor,
  }: TokenStageParams<T, MasterChefContractPositionDataProps, MasterChefContractPositionDescriptor>) {
    const tokens: UnderlyingTokenDescriptor[] = [];

    const stakedTokenAddress = await this.getStakedTokenAddress(contract, descriptor.poolIndex);
    const rewardTokenAddress = await this.getRewardTokenAddress(contract, descriptor.poolIndex);

    tokens.push({ metaType: MetaType.SUPPLIED, address: stakedTokenAddress });
    tokens.push({ metaType: MetaType.CLAIMABLE, address: rewardTokenAddress });
    return tokens;
  }

  async getDataProps({
    contract,
    contractPosition,
    descriptor,
    multicall,
  }: DataPropsStageParams<T, V, MasterChefContractPositionDescriptor>): Promise<V> {
    const poolIndex = descriptor.poolIndex;
    const stakedToken = contractPosition.tokens.find(isSupplied)!;
    const primaryClaimableToken = contractPosition.tokens.filter(isClaimable)[0];

    const [totalAllocPoints, totalRewardRate, poolAllocPoints] = await Promise.all([
      this.getTotalAllocPoints(contract, poolIndex),
      this.getTotalRewardRate(contract, poolIndex),
      this.getPoolAllocPoints(contract, poolIndex),
    ]);

    const poolShare = Number(poolAllocPoints) / Number(totalAllocPoints);
    const rewardRate = poolShare * Number(totalRewardRate);

    const stakedTokenContract = this.appToolkit.globalContracts.erc20(stakedToken);
    const reserveRaw = await multicall.wrap(stakedTokenContract).balanceOf(contractPosition.address);
    const reserve = Number(reserveRaw) / 10 ** stakedToken.decimals;
    const liquidity = reserve * stakedToken.price;

    const multiplier = this.rewardRateUnit === RewardRateUnit.BLOCK ? BLOCKS_PER_DAY[this.network] : 86400;
    const dailyRewardRate = rewardRate * multiplier;
    const dailyRewardRateUSD = dailyRewardRate * primaryClaimableToken.price;

    const dailyROI = (dailyRewardRateUSD + liquidity) / liquidity - 1;
    const weeklyROI = Number(dailyROI * 7);
    const yearlyROI = dailyROI * 365;
    const isActive = yearlyROI > 0;

    return { poolIndex, liquidity, dailyROI, weeklyROI, yearlyROI, isActive } as V;
  }

  async getLabel({ contractPosition }: DisplayPropsStageParams<T>) {
    const stakedToken = contractPosition.tokens.find(isSupplied)!;
    return getLabelFromToken(stakedToken);
  }

  async getTokenBalancesPerPosition({
    address,
    contractPosition,
    contract,
  }: GetTokenBalancesPerPositionParams<T, MasterChefContractPositionDataProps>) {
    const tokenBalances: BigNumberish[] = [];
    const poolIndex = contractPosition.dataProps.poolIndex;

    const [stakedBalanceRaw, rewardTokenBalanceRaw] = await Promise.all([
      this.getStakedTokenBalance(address, contract, poolIndex),
      this.getRewardTokenBalance(address, contract, poolIndex),
    ]);

    tokenBalances.push(stakedBalanceRaw);
    tokenBalances.push(rewardTokenBalanceRaw);
    return tokenBalances;
  }
}