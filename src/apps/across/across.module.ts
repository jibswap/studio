import { Module } from '@nestjs/common';

import { AbstractApp } from '~app/app.dynamic-module';

import { AcrossViemContractFactory } from './contracts';
import { EthereumAcrossPoolV2TokenFetcher } from './ethereum/across.pool-v2.token-fetcher';
import { EthereumStakingContractPositionFetcher } from './ethereum/across.staking.contract-position-fetcher';

@Module({
  providers: [AcrossViemContractFactory, EthereumAcrossPoolV2TokenFetcher, EthereumStakingContractPositionFetcher],
})
export class AcrossAppModule extends AbstractApp() {}
