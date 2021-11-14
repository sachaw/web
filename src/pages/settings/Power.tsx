import React from 'react';

import { useForm } from 'react-hook-form';
import { FiCode, FiMenu } from 'react-icons/fi';
import JSONPretty from 'react-json-pretty';

import { FormFooter } from '@app/components/FormFooter';
import { Select } from '@app/components/generic/form/Select';
import { connection } from '@app/core/connection';
import { useAppSelector } from '@app/hooks/redux';
import { Card } from '@components/generic/Card';
import { Cover } from '@components/generic/Cover';
import { Checkbox } from '@components/generic/form/Checkbox';
import { IconButton } from '@components/generic/IconButton';
import { PrimaryTemplate } from '@components/templates/PrimaryTemplate';
import { Protobuf } from '@meshtastic/meshtasticjs';

export interface PowerProps {
  navOpen?: boolean;
  setNavOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Power = ({ navOpen, setNavOpen }: PowerProps): JSX.Element => {
  const preferences = useAppSelector((state) => state.meshtastic.preferences);
  const [debug, setDebug] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { register, handleSubmit, formState, reset } =
    useForm<Protobuf.RadioConfig_UserPreferences>({
      defaultValues: {
        ...preferences,
        isLowPower: preferences.isRouter ? true : preferences.isLowPower,
      },
    });

  const onSubmit = handleSubmit((data) => {
    setLoading(true);
    void connection.setPreferences(data, async () => {
      await Promise.resolve();
      setLoading(false);
    });
  });
  return (
    <PrimaryTemplate
      title="Power"
      tagline="Settings"
      leftButton={
        <IconButton
          icon={<FiMenu className="w-5 h-5" />}
          onClick={(): void => {
            setNavOpen && setNavOpen(!navOpen);
          }}
        />
      }
      rightButton={
        <IconButton
          icon={<FiCode className="w-5 h-5" />}
          active={debug}
          onClick={(): void => {
            setDebug(!debug);
          }}
        />
      }
      footer={
        <FormFooter
          dirty={formState.isDirty}
          saveAction={onSubmit}
          clearAction={reset}
        />
      }
    >
      <Card loading={loading}>
        <Cover enabled={debug} content={<JSONPretty data={preferences} />} />
        <div className="w-full max-w-3xl p-10 md:max-w-xl">
          <form className="space-y-2" onSubmit={onSubmit}>
            <Select
              label="Charge current"
              optionsEnum={Protobuf.ChargeCurrent}
              {...register('chargeCurrent', { valueAsNumber: true })}
            />
            <Checkbox label="Always powered" {...register('isAlwaysPowered')} />
            <Checkbox
              label="Powered by low power source (solar)"
              disabled={preferences.isRouter}
              validationMessage={
                preferences.isRouter ? 'Enabled by default in router mode' : ''
              }
              {...register('isLowPower')}
            />
          </form>
        </div>
      </Card>
    </PrimaryTemplate>
  );
};